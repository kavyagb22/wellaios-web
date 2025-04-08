import {useState, useEffect, useRef} from 'react';
import ChatHistory from './history';
import UserInputPane from './chatinput';
import {fetchAPI} from '@/control/api';
import styled from 'styled-components';
import {MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {WebChatRequestType, WebRequestType} from '@/interface/api';

const ChatPane: React.FC<{agent: WebWELLAgent}> = function ({agent}) {
    const chatEndRef = useRef<HTMLDivElement | null>(null);
    const [history, setHistory] = useState<MsgType[]>([]);
    const [isTyping, setIsTyping] = useState<number>(0);

    const startTyping = () => setIsTyping(t => t + 1);
    const doneTyping = () => setIsTyping(t => Math.max(t - 1, 0));

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [history]);

    const addMessage = function (msg: MsgType) {
        setHistory(prev => {
            const updatedHistory = [...prev, msg];
            const slicedHistory = updatedHistory.slice(-20); // keep latest 20
            aiProcess(slicedHistory);
            return updatedHistory;
        });
    };

    const aiProcess = async function (slicedHistory: MsgType[]) {
        startTyping();
        const payload: WebChatRequestType = {
            agent: agent.id,
            msgs: slicedHistory,
        };
        const query: WebRequestType = {type: 'web_chat', task: payload};
        const response = await fetchAPI(query);
        doneTyping();
        console.log('chatbot response: ', response);
        const assistantMsg: MsgType = {
            role: 'assistant',
            content: response.content || '...',
        };
        setHistory(prev => [...prev, assistantMsg]);
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
                <ChatHistory
                    history={history}
                    agent={agent}
                    // user={user}
                    // startTalking={talk}
                    // stopTalking={stopTalking}
                />
            </div>

            {isTyping > 0 && (
                <TypingIndicator>Agent is typing ... </TypingIndicator>
            )}

            <div style={{minHeight: '77px', width: '100vw'}}>
                <UserInputPane addMessage={addMessage} />
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

const TypingIndicator = styled.div`
    background: #062e45;
    opacity: 1;
    height: 25px;
    text-align: center;
    color: #ffffff;
    padding-top: 6px;
    font: normal normal medium 11px/15px Montserrat;
`;

export default ChatPane;
