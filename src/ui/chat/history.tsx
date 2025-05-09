import {Card, Icon, Spinner} from '@blueprintjs/core';
import {ReactNode, useEffect, useRef} from 'react';
import Markdown, {Components} from 'react-markdown';
import {ChatRoleType, MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {DEFAULT_IMAGES} from '@/config/constants';
import {getMediaWithDefault} from '@/control/utils/media';
import Image from 'next/image';
import AudioButton from './audiobutton';
import {ReactUnityEventParameter} from 'react-unity-webgl/distribution/types/react-unity-event-parameters';

const ChatHistory: React.FC<{
    history: MsgType[];
    agent: WebWELLAgent;
    startTalking: () => void;
    talking: boolean;
    emoting: boolean;
    animAction: boolean;
    isLoaded: boolean;
    sendMessage: (
        gameobj: string,
        method: string,
        params: ReactUnityEventParameter
    ) => void;
}> = function ({
    history,
    agent,
    startTalking,
    talking,
    emoting,
    animAction,
    isLoaded,
    sendMessage,
}) {
    const chatWinDiv = useRef<HTMLDivElement | null>(null);
    const userPic = getMediaWithDefault(
        agent.meta.profile,
        DEFAULT_IMAGES['profile']
    );

    useEffect(() => {
        if (chatWinDiv.current) {
            chatWinDiv.current.scrollTop = chatWinDiv.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="h-[100%] w-[100%] relative">
            <div className="absolute inset-0 overflow-hidden flex flex-col justify-end">
                <div
                    className="flex flex-col px-[8px] overflow-y-auto"
                    ref={chatWinDiv}
                >
                    {history === undefined ? (
                        <Spinner />
                    ) : (
                        history.map((x, i) => (
                            <ChatItem
                                key={i}
                                agent={agent.id}
                                item={x}
                                userPic={userPic}
                                playingAudio={!isLoaded || talking}
                                playingAnimation={!isLoaded || emoting}
                                playingActionAnimation={!isLoaded || animAction}
                                startTalking={startTalking}
                                sendMessage={sendMessage}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatItem: React.FC<{
    agent: string;
    item: MsgType;
    userPic?: string;
    playingAudio: boolean;
    playingAnimation: boolean;
    playingActionAnimation: boolean;
    startTalking: () => void;
    sendMessage: (
        gameobj: string,
        method: string,
        params: ReactUnityEventParameter
    ) => void;
}> = function ({
    agent,
    item,
    userPic,
    playingAudio,
    playingAnimation,
    playingActionAnimation,
    startTalking,
    sendMessage,
}) {
    const itemRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={itemRef}
            style={{
                display: 'flex',
                margin: 2,
                paddingLeft: 10,
                paddingRight: 10,
                position: 'relative',
                justifyContent: MsgCardJustifySettings[item.role],
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: 1,
                transition: 'opacity 0.2s ease-out',
            }}
        >
            {item.role === 'assistant' ? (
                <>
                    <MsgIcon msgrole={item.role} userPic={userPic} />
                    <MsgCard msgrole={item.role}>
                        <div className="flex items-center">
                            <Markdown
                                className="flex-col"
                                components={mComponents}
                            >
                                {item.content}
                            </Markdown>
                        </div>
                        <AudioButton
                            agent={agent}
                            playingAudio={playingAudio}
                            playingAnimation={playingAnimation}
                            playingActionAnimation={playingActionAnimation}
                            text={item.content}
                            emotion={item.emotion}
                            startTalking={startTalking}
                            sendMessage={sendMessage}
                        />
                    </MsgCard>
                </>
            ) : (
                <>
                    <MsgCard msgrole={item.role}>
                        <Markdown components={mComponents}>
                            {item.content}
                        </Markdown>
                    </MsgCard>
                    <MsgIcon msgrole={item.role} />
                </>
            )}
        </div>
    );
};

const mComponents: Components = {
    strong: props => <b className="text-white">{props.children}</b>,
    a: props => (
        <a href={props.href} target="_blank" rel="noreferrer">
            {props.children}
        </a>
    ),
    p: props => <p className="m-0">{props.children}</p>,
};

const MsgCard: React.FC<{children?: ReactNode; msgrole: ChatRoleType}> =
    function ({children, msgrole}) {
        return (
            <Card
                style={{
                    borderRadius: 8,
                    opacity: 0.85,
                    margin: 2,
                    padding: 10,
                    marginLeft: msgrole === 'assistant' ? 6 : undefined,
                    marginRight: msgrole !== 'assistant' ? 6 : 6,
                    color: msgrole === 'assistant' ? 'white' : 'black',
                    overflowWrap: 'break-word',
                    backgroundColor:
                        msgrole === 'assistant' ? '#00A4F6' : '#D4D4D4',
                    font: 'normal normal medium 11px/15px Montserrat',
                }}
                className={
                    'pointer-events-none touch-none text-[13px] text-left max-w-[90%] flex justify-between'
                }
            >
                {children}
            </Card>
        );
    };

const MsgIcon: React.FC<{msgrole: ChatRoleType; userPic?: string}> = function ({
    msgrole,
    userPic,
}) {
    return (
        <div className={'rounded-[50%] w-[30px] h-[30px] relative'}>
            {userPic ? (
                <Image
                    className={'object-top object-cover rounded-[50%] '}
                    src={userPic}
                    fill
                    draggable={false}
                    alt="Profile image"
                />
            ) : msgrole === 'assistant' ? (
                <Image
                    className={'object-top object-cover rounded-[50%] '}
                    src={DEFAULT_IMAGES['profile']}
                    fill
                    draggable={false}
                    alt="Profile image"
                />
            ) : (
                <Icon icon="user" color="#FFFA" size={30} />
            )}
        </div>
    );
};

const MsgCardJustifySettings: Record<ChatRoleType, string> = {
    assistant: 'left',
    user: 'right',
};

export default ChatHistory;
