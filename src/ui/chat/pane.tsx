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

const ErrorMsg = 'Failed to get a response. Please try again.';

const ChatPane: React.FC<{agent: WebWELLAgent; uid: string | null}> =
    function ({agent, uid}) {
        const chatEndRef = useRef<HTMLDivElement | null>(null);
        const {history, addMessage} = useHistory(uid);
        const [isTyping, setIsTyping] = useState<number>(0);
        const [talking, setTalking] = useState<number>(0);
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
        const doneTalking = () => setTalking(t => Math.max(t - 1, 0));

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
            const query: WebRequestType = {type: 'web_chat', task: payload};
            fetchAPI(query)
                .then(response => {
                    console.log(response);
                    const msg = response.content || '...';
                    const assistantMsg: MsgType = {
                        role: 'assistant',
                        emotion: response.emotion,
                        content: msg,
                        timestamp: getCurrentTS(),
                    };
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

        return (
            <div className="flex-1 flex flex-col">
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
                            />
                        )}
                        {isTyping > 0 && <TypingPane name={agent.meta.name} />}
                    </div>
                    <UnityPane
                        profile={getMediaWithDefault(
                            agent.meta.profile,
                            DEFAULT_IMAGES['profile']
                        )}
                        unityProvider={unityProvider}
                        isLoaded={isLoaded}
                    />
                </div>
                <UserInputPane addMessage={addUserMessage} />
            </div>
        );
    };

const TypingPane: React.FC<{name: string}> = function ({name}) {
    return (
        <div
            className="h-[25px] text-center text-white pt-[6px] flex justify-center"
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
