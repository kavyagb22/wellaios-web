import React, {useState, useEffect, useRef} from 'react';
import ChatHistory from './history';
import UserInputPane from './chatinput';
import {fetchAPI} from '@/control/api';
import {LLMMsgType, MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {WebChatRequestType, WebRequestType} from '@/interface/api';
import {useHistory} from '@/control/hooks/localhistory';
import {getCurrentTS} from '@/control/helper';
import {motion} from 'framer-motion';
import UnityPane from '../visual/unity';
import {DEFAULT_IMAGES} from '@/config/constants';
import {getMediaWithDefault} from '@/control/utils/media';
import {useUnityContext} from 'react-unity-webgl';
import {Button} from '@blueprintjs/core';
import Image from 'next/image';

const ErrorMsg = 'Failed to get a response. Please try again.';

const ChatPane: React.FC<{agent: WebWELLAgent; uid: string | null}> =
    function ({agent, uid}) {
        const chatEndRef = useRef<HTMLDivElement | null>(null);
        const {history, addMessage, clearHistory} = useHistory(agent.id, uid);
        const [isTyping, setIsTyping] = useState<number>(0);
        const [talking, setTalking] = useState<number>(0);
        const [emoting, setEmoting] = useState<number>(0);
        const [animAction, setAnimAction] = useState<number>(0);
        const [activeAudioIndex, setActiveAudioIndex] = useState<number | null>(
            null
        );
        const {unityProvider, sendMessage, addEventListener, isLoaded} =
            useUnityContext({
                loaderUrl: 'unity/unity.loader.js',
                dataUrl: 'unity/unity.data',
                frameworkUrl: 'unity/unity.framework.js',
                codeUrl: 'unity/unity.wasm',
            });

        const startTyping = () => setIsTyping(t => t + 1);
        const doneTyping = () => setIsTyping(t => Math.max(t - 1, 0));

        const startTalking = () => setTalking(t => t + 1);
        const doneTalking = () => {
            setTalking(t => Math.max(t - 1, 0));
            setActiveAudioIndex(null);
        };

        const startEmoting = () => setEmoting(t => t + 1);
        const doneEmoting = () => {
            console.log('doneEmoting triggered');
            setEmoting(t => Math.max(t - 1, 0));
        };

        const startAnimAction = () => setAnimAction(t => t + 1);
        const doneAnimAction = () => {
            console.log('doneAnimAction triggered');
            setAnimAction(t => Math.max(t - 1, 0));
        };

        // Auto-scroll to the latest message
        useEffect(() => {
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({behavior: 'smooth'});
            }
        }, [history]);

        useEffect(() => {
            addEventListener('TalkEnded', doneTalking);
            // addEventListener('ActionEnded', actionEnded);
        }, [addEventListener]);

        useEffect(() => {
            addEventListener('EmotionEnded', doneEmoting);
            // addEventListener('ActionEnded', actionEnded);
        }, [addEventListener]);

        useEffect(() => {
            addEventListener('AnimActionEnded', doneAnimAction);
            // addEventListener('ActionEnded', actionEnded);
        }, [addEventListener]);

        const addUserMessage = function (msg: MsgType) {
            if (history !== undefined) {
                const updatedHistory = [...history, msg];
                const slicedHistory = updatedHistory
                    .slice(-20)
                    .map(x => ({role: x.role, content: x.content})); // keep latest 20
                aiProcess(slicedHistory);
                addMessage(msg);
            }
        };

        const aiProcess = async function (slicedHistory: LLMMsgType[]) {
            startTyping();
            const payload: WebChatRequestType = {
                agent: agent.id,
                msgs: slicedHistory,
            };
            if (uid !== null) {
                payload.userid = uid;
            }
            const query: WebRequestType = {type: 'web_chat', task: payload};
            fetchAPI(query)
                .then(response => {
                    console.log(response);
                    console.log('emotion:', response.emotion);
                    const msg = response.content || '...';
                    const assistantMsg: MsgType = {
                        role: 'assistant',
                        emotion: response.emotion,
                        content: msg,
                        timestamp: getCurrentTS(),
                    };

                    if (isLoaded && response.emotion) {
                        startEmoting();
                        sendMessage(
                            'Kiki01',
                            'EmotionAnimation',
                            response.emotion
                        );
                    }

                    addMessage(assistantMsg);
                })
                .catch(error => {
                    console.error(error);
                    const assistantMsg: MsgType = {
                        role: 'assistant',
                        content: ErrorMsg,
                        emotion: 'sad',
                        timestamp: getCurrentTS(),
                    };
                    addMessage(assistantMsg);
                })
                .finally(() => {
                    doneTyping();
                });
        };

        const generateRandomAnimation = () => {
            const animations = ['hugging', 'waving', 'dancing'];
            const randomIndex = Math.floor(Math.random() * animations.length);
            const randomAnimation = animations[randomIndex];

            startAnimAction();

            sendMessage('Kiki01', 'ActionAnimation', randomAnimation);
        };

        return (
            <div className="flex-1 flex flex-col">
                <div className="flex justify-end p-2">
                    {/* <Button
                        className="w-[200px] bp4-intent-danger"
                        onClick={() => clearHistory()}
                    >
                        Clear History
                    </Button> */}
                </div>
                <div className="flex-1 flex items-stretch">
                    <div className="flex-[7] h-[100%] flex flex-col overflow-hidden relative">
                        {history !== undefined && (
                            <ChatHistory
                                history={history}
                                agent={agent}
                                startTalking={startTalking}
                                talking={talking > 0}
                                isLoaded={isLoaded}
                                sendMessage={sendMessage}
                                emoting={emoting > 0}
                                animAction={animAction > 0}
                                activeAudioIndex={activeAudioIndex}
                                setActiveAudioIndex={setActiveAudioIndex}
                            />
                        )}
                        {isTyping > 0 && <TypingPane name={agent.meta.name} />}
                        <UserInputPane addMessage={addUserMessage} uid={uid} />
                    </div>

                    <div className="flex flex-col flex-[3] relative m-[10px]">
                        <UnityPane
                            profile={getMediaWithDefault(
                                agent.meta.profile,
                                DEFAULT_IMAGES['profile']
                            )}
                            unityProvider={unityProvider}
                            isLoaded={isLoaded}
                        />
                        {/* ✅ Styled box under UnityPane */}
                        <div
                            className="flex flex-row gap-[12px] bg-[#f5f5f5] opacity-100 p-[4px] items-center flex justify-center"
                            style={{
                                borderRadius: '0px 0px 16px 16px',
                                backgroundRepeat: 'repeat',
                                backgroundOrigin: 'padding-box',
                            }}
                        >
                            <button
                                className="border-[1px] border-[#67677466] rounded-[12px] p-[4px]"
                                onClick={generateRandomAnimation}
                                disabled={animAction > 0}
                            >
                                <Image
                                    src="happy-icon.svg"
                                    width={24}
                                    height={24}
                                    draggable={false}
                                    alt="Attachment icon"
                                />
                            </button>
                            <button
                                className="border-[1px] border-[#6767741A] rounded-[12px] p-[6px]"
                                onClick={generateRandomAnimation}
                                disabled={animAction > 0}
                            >
                                <Image
                                    src="phone-icon.svg"
                                    width={24}
                                    height={24}
                                    draggable={false}
                                    alt="Attachment icon"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

const TypingPane: React.FC<{name: string}> = function ({name}) {
    return (
        <div
            className="h-[25px] text-center text-black pt-[6px] flex justify-center"
            style={{font: 'normal normal medium 11px/15px Montserrat'}}
        >
            {name} is typing <AnimationDot delay={0} />
            <AnimationDot delay={0.2} />
            <AnimationDot delay={0.4} />
        </div>
    );
};

const AnimationDot: React.FC<{delay: number}> = function ({delay}) {
    return (
        <motion.div
            animate={{
                y: [0, -5, 0],
                transition: {
                    delay,
                    repeat: Infinity,
                    duration: 0.6,
                    repeatDelay: 0.5,
                },
            }}
        >
            .
        </motion.div>
    );
};

export default ChatPane;
