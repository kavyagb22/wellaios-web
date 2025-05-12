import {
    Button,
    Card,
    Icon,
    Popover,
    Position,
    Spinner,
} from '@blueprintjs/core';
import {ReactNode, useEffect, useRef, useState} from 'react';
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

    const [globalVolume, setGlobalVolume] = useState(100); // Global volume state
    const handleGlobalVolumeChange = (newVolume: number) => {
        setGlobalVolume(newVolume);
        sendMessage('Kiki01', 'setVolume', (newVolume / 100).toFixed(2)); // Send volume to Unity
    };

    useEffect(() => {
        if (chatWinDiv.current) {
            chatWinDiv.current.scrollTop = chatWinDiv.current.scrollHeight;
        }
        console.log('Chat history updated:', history);
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
                                index={i}
                                agent={agent.id}
                                item={x}
                                userPic={userPic}
                                playingAudio={!isLoaded || talking}
                                playingAnimation={!isLoaded || emoting}
                                playingActionAnimation={!isLoaded || animAction}
                                startTalking={startTalking}
                                sendMessage={sendMessage}
                                globalVolume={globalVolume}
                                onGlobalVolumeChange={handleGlobalVolumeChange}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatItem: React.FC<{
    index: number;
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
    globalVolume: number;
    onGlobalVolumeChange: (volume: number) => void;
}> = function ({
    index,
    agent,
    item,
    userPic,
    playingAudio,
    playingAnimation,
    playingActionAnimation,
    startTalking,
    sendMessage,
    globalVolume,
    onGlobalVolumeChange,
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
                <div className="flex">
                    <div className="mt-[12px]">
                        <MsgIcon msgrole={item.role} userPic={userPic} />
                    </div>
                    <div className="flex flex-col items-start">
                        <MsgCard msgrole={item.role}>
                            <div className="flex items-center">
                                <Markdown
                                    className="flex-col"
                                    components={mComponents}
                                >
                                    {item.content}
                                </Markdown>
                            </div>
                        </MsgCard>
                        <div className="flex flex-row gap-[6px] ml-[16px]">
                            <AudioButton
                                agent={agent}
                                playingAudio={playingAudio}
                                playingAnimation={playingAnimation}
                                playingActionAnimation={playingActionAnimation}
                                text={item.content}
                                emotion={item.emotion}
                                startTalking={startTalking}
                                sendMessage={sendMessage}
                                globalVolume={globalVolume}
                                onGlobalVolumeChange={onGlobalVolumeChange}
                            />
                            <CopyButton content={item.content} />
                            <RedoButton />
                            <LinkButton />
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <MsgCard msgrole={item.role}>
                        {/* <Markdown components={mComponents}>
                            {item.content}
                        </Markdown> */}
                        <div className="flex flex-col items-center text-center">
                            {/* First render images */}
                            {Array.isArray(item.content) &&
                                item.content
                                    .filter(part => part.type === 'image_url')
                                    .map((part, idx) => (
                                        <div
                                            key={`img-${idx}`}
                                            className="mb-2"
                                        >
                                            <Image
                                                src={
                                                    (part as any).image_url.url
                                                }
                                                alt="User uploaded"
                                                width={220}
                                                height={220}
                                                className="rounded-md object-contain"
                                            />
                                        </div>
                                    ))}

                            {/* Then render text */}
                            {Array.isArray(item.content) &&
                                item.content
                                    .filter(part => part.type === 'text')
                                    .map((part, idx) => (
                                        <Markdown
                                            key={`text-${idx}`}
                                            components={mComponents}
                                            className="text-[14px]"
                                        >
                                            {(part as any).text}
                                        </Markdown>
                                    ))}
                        </div>
                    </MsgCard>
                    {/* <MsgIcon msgrole={item.role} /> */}
                </div>
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
            <div
                style={{
                    borderRadius: 8,
                    opacity: 0.85,
                    margin: 2,
                    padding: 10,
                    marginLeft: msgrole === 'assistant' ? 6 : undefined,
                    marginRight: msgrole !== 'assistant' ? 6 : 6,
                    // color: msgrole === 'assistant' ? 'white' : 'black',
                    overflowWrap: 'break-word',
                    backgroundColor: msgrole === 'assistant' ? '' : '#4BADFF1A',
                    font: 'normal normal medium 11px/15px Montserrat',
                }}
                className={
                    'pointer-events-none touch-none text-[13px] text-left max-w-[90%] flex justify-between'
                }
            >
                {children}
            </div>
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

const CopyButton: React.FC<{content: string}> = function ({content}) {
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };
    return (
        <CustomPopover tooltip="Copy">
            <button onClick={handleCopy} style={{pointerEvents: 'all'}}>
                <div className="bg-[#f6f6f6] rounded-[4px] p-[4px] flex flex-row items-center">
                    <Image
                        src={copied ? 'check-icon.svg' : 'copy-icon.svg'}
                        width={16}
                        height={16}
                        alt={copied ? 'copied' : 'copy'}
                        draggable={false}
                    />
                    {copied && (
                        <span className="text-[10px] text-[#676774] ml-[2px]">
                            Copied
                        </span>
                    )}
                </div>
            </button>
        </CustomPopover>
    );
};

const RedoButton = function () {
    return (
        <CustomPopover tooltip="Retry">
            <button style={{pointerEvents: 'all'}}>
                <div className="bg-[#f6f6f6] rounded-[4px] p-[4px]">
                    <Image
                        src="sync-icon.svg"
                        width={16}
                        height={16}
                        draggable={false}
                        alt="copy"
                    />
                </div>
            </button>
        </CustomPopover>
    );
};

const LinkButton = function () {
    return (
        <CustomPopover tooltip="Sources">
            <button style={{pointerEvents: 'all'}}>
                <div className="bg-[#f6f6f6] rounded-[4px] p-[4px]">
                    <Image
                        src="link-icon.svg"
                        width={16}
                        height={16}
                        draggable={false}
                        alt="copy"
                    />
                </div>
            </button>
        </CustomPopover>
    );
};

export const CustomPopover = ({
    children,
    tooltip,
}: {
    children: React.ReactNode;
    tooltip: string;
}) => {
    const [show, setShow] = useState(false);
    const timer = useRef<NodeJS.Timeout | null>(null);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => {
                if (timer.current) clearTimeout(timer.current);
                setShow(true);
            }}
            onMouseLeave={() => {
                timer.current = setTimeout(() => setShow(false), 100);
            }}
            onClick={e => {
                // Optional: prevent click from affecting tooltip visibility
                e.stopPropagation();
            }}
        >
            {/* Clone children to avoid pointer-events issues */}
            <div className="pointer-events-auto">{children}</div>
            {show && (
                <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 pointer-events-none">
                    <div className="relative">
                        <div className="bg-[#012F44] text-white text-[10px] px-1 py-1 rounded shadow-lg whitespace-nowrap">
                            {tooltip}
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-full">
                            <svg className="h-3 w-4" viewBox="0 0 20 10">
                                <polygon
                                    points="0,10 10,0 20,10"
                                    fill="#012F44"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatHistory;
