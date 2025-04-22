import React, {useState, useEffect, useRef} from 'react';
import ChatHistory from './history';
import UserInputPane from './chatinput';
import {fetchAPI} from '@/control/api';
import styled from 'styled-components';
import {MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {WebChatRequestType, WebRequestType} from '@/interface/api';
import {useHistory} from '@/control/hooks/localhistory';
import {getCurrentTS} from '@/control/helper';
import {motion} from 'framer-motion';

const ErrorMsg = 'Failed to get a response. Please try again.';

const ChatPane: React.FC<{agent: WebWELLAgent; talk: (x: string) => void}> =
    function ({agent, talk}) {
        const chatEndRef = useRef<HTMLDivElement | null>(null);
        const {history, addMessage} = useHistory();
        const [isTyping, setIsTyping] = useState<number>(1);

        const startTyping = () => setIsTyping(t => t + 1);
        const doneTyping = () => setIsTyping(t => Math.max(t - 1, 0));

        // Auto-scroll to the latest message
        useEffect(() => {
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({behavior: 'smooth'});
            }
        }, [history]);

        const addUserMessage = function (msg: MsgType) {
            if (history !== undefined) {
                const updatedHistory = [...history, msg];
                const slicedHistory = updatedHistory.slice(-20); // keep latest 20
                aiProcess(slicedHistory);
                addMessage(msg);
            }
        };

        const aiProcess = async function (slicedHistory: MsgType[]) {
            startTyping();
            const payload: WebChatRequestType = {
                agent: agent.id,
                msgs: slicedHistory,
            };
            const query: WebRequestType = {type: 'web_chat', task: payload};
            fetchAPI(query)
                .then(response => {
                    const msg = response.content || '...';
                    talk(msg);
                    const assistantMsg: MsgType = {
                        role: 'assistant',
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
                        timestamp: getCurrentTS(),
                    };
                    addMessage(assistantMsg);
                })
                .finally(() => {
                    doneTyping();
                });
        };

        return (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    scrollbarWidth: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <div style={{width: '100vw', flex: 21}} />

                <div style={{width: '100vw', minHeight: '299px'}}>
                    {history !== undefined && (
                        <ChatHistory history={history} agent={agent} />
                    )}
                </div>

                {isTyping > 0 && <TypingPane name={agent.meta.name} />}

                <div style={{minHeight: '77px', width: '100vw'}}>
                    <UserInputPane addMessage={addUserMessage} />
                </div>
                <style jsx>
                    {`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}
                </style>
            </div>
        );
    };

const TypingPane: React.FC<{name: string}> = function ({name}) {
    return (
        <TypingIndicator>
            {name} is typing <AnimationDot delay={0} />
            <AnimationDot delay={0.2} />
            <AnimationDot delay={0.4} />
        </TypingIndicator>
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

const TypingIndicator = styled.div`
    background: #062e45;
    opacity: 1;
    height: 25px;
    text-align: center;
    color: #ffffff;
    padding-top: 6px;
    display: flex;
    justify-content: center;
    font: normal normal medium 11px/15px Montserrat;
`;

export default ChatPane;
