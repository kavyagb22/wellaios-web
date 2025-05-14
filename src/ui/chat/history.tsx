import {Icon, Spinner} from '@blueprintjs/core';
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import Markdown, {Components} from 'react-markdown';
import {ChatRoleType, MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {DEFAULT_IMAGES} from '@/config/constants';
import {getMediaWithDefault} from '@/control/utils/media';
import Image from 'next/image';
import AudioButton from './input/audiobutton';
import {ReactUnityEventParameter} from 'react-unity-webgl/distribution/types/react-unity-event-parameters';
import CustomPopover from '@/ui/common/custompopover';
import {displayTime} from '@/control/helper';

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
    activeAudioIndex: number | null;
    setActiveAudioIndex: (index: number | null) => void;
}> = function ({
    history,
    agent,
    startTalking,
    talking,
    emoting,
    animAction,
    isLoaded,
    sendMessage,
    activeAudioIndex,
    setActiveAudioIndex,
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
                                setActiveAudioIndex={setActiveAudioIndex}
                                isActive={activeAudioIndex === i}
                                activeAudioIndex={activeAudioIndex}
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
    setActiveAudioIndex: (index: number | null) => void;
    isActive: boolean;
    activeAudioIndex: number | null;
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
    setActiveAudioIndex,
    isActive,
    activeAudioIndex,
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
                <div className="flex flex-row justify-between w-full items-end">
                    <div className="flex">
                        <div className="mt-[12px]">
                            <MsgIcon msgrole={item.role} userPic={userPic} />
                        </div>
                        <div className="flex flex-col items-start">
                            <MsgCard msgrole={item.role}>
                                <div className="flex flex-col text-left">
                                    <ShowImageFromUrl item={item} />
                                    <ShowTextContent item={item} />
                                </div>
                            </MsgCard>
                            <div className="w-full flex flex-row items-center justify-between ml-[16px]">
                                <div className="flex flex-row gap-[6px] items-center">
                                    <AudioButton
                                        agent={agent}
                                        playingAudio={playingAudio}
                                        playingAnimation={playingAnimation}
                                        playingActionAnimation={
                                            playingActionAnimation
                                        }
                                        text={
                                            Array.isArray(item.content)
                                                ? item.content.filter(
                                                      part =>
                                                          part.type === 'text'
                                                  )[0].text
                                                : item.content
                                        }
                                        emotion={item.emotion}
                                        startTalking={() => {
                                            startTalking();
                                            setActiveAudioIndex(index);
                                        }}
                                        sendMessage={sendMessage}
                                        globalVolume={globalVolume}
                                        onGlobalVolumeChange={
                                            onGlobalVolumeChange
                                        }
                                        isActive={isActive}
                                        disabled={
                                            activeAudioIndex !== null &&
                                            !isActive
                                        }
                                        onStop={() => {
                                            setActiveAudioIndex(null);
                                        }}
                                    />
                                    <CopyButton
                                        content={
                                            Array.isArray(item.content)
                                                ? item.content.filter(
                                                      part =>
                                                          part.type === 'text'
                                                  )[0].text
                                                : item.content
                                        }
                                    />
                                    <RedoButton />
                                    <LinkButton />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-[#a6a6b9] text-[12px] mb-[12px] min-w-[50px]">
                        {displayTime(item.timestamp)}
                    </div>
                </div>
            ) : (
                <MsgCard msgrole={item.role}>
                    <div className="flex gap-[4px] flex-col">
                        <div>
                            <div className="flex flex-col text-left">
                                <ShowImageFromUrl item={item} />
                                <ShowTextContent item={item} />
                            </div>
                        </div>

                        <div className="text-[#a6a6b9] text-[12px] text-right self-end">
                            {displayTime(item.timestamp)}
                        </div>
                    </div>
                </MsgCard>
            )}
        </div>
    );
};

const ShowImageFromUrl: React.FC<{item: MsgType}> = ({item}) => {
    return (
        <>
            {Array.isArray(item.content) &&
                item.content
                    .filter(part => part.type === 'image_url')
                    .map((part, idx) => (
                        <div key={`img-${idx}`} className="mb-2">
                            <LoadImage src={part.image_url.url} />
                        </div>
                    ))}
        </>
    );
};

const ShowTextContent: React.FC<{item: MsgType}> = ({item}) => {
    return (
        <>
            {Array.isArray(item.content) ? (
                item.content
                    .filter(part => part.type === 'text')
                    .map((part, index) => (
                        <Markdown
                            key={`text-${index}`}
                            components={mComponents}
                            className="text-[14px]"
                        >
                            {part.text}
                        </Markdown>
                    ))
            ) : (
                <Markdown components={mComponents} className="text-[14px]">
                    {item.content}
                </Markdown>
            )}
        </>
    );
};

const LoadImage: React.FC<{src: string}> = ({src}) => {
    const [loadAttempt, setLoadAttempt] = useState<number>(0);
    const [error, setError] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [retry, setRetry] = useState<string>(src);

    useEffect(() => {
        if (error) {
            const interval = setInterval(() => {
                setLoadAttempt(prev => prev + 1);
                setRetry(`${src}?retry=${Date.now()}`);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [error, 3000, src]);

    return (
        <div className="relative">
            {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 rounded-md gap-[8px] ">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-[#a6a6b9] text-[14px]">
                        Generating the Image, please wait
                    </div>
                </div>
            )}
            <Image
                key={retry}
                src={retry}
                alt="generate"
                width={220}
                height={220}
                className={`rounded-md object-contain ${loaded ? '' : 'invisible'}`}
                onLoad={() => {
                    setError(false);
                    setLoaded(true);
                }}
                onError={() => {
                    setError(true);
                    setLoaded(false);
                }}
            />
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
        const isAssistant = msgrole === 'assistant';
        return (
            <div
                style={{
                    borderRadius: 8,
                    opacity: 0.85,
                    margin: 2,
                    padding: 10,
                    marginLeft: isAssistant ? 6 : undefined,
                    marginRight: !isAssistant ? 6 : 6,
                    overflowWrap: 'break-word',
                    backgroundColor: isAssistant ? '' : '#4BADFF1A',
                    font: 'normal normal medium 11px/15px Montserrat',
                }}
                className={`${isAssistant ? 'max-w-full' : 'max-w-[80%]'} pointer-events-none touch-none text-[13px] text-left flex justify-between ${!isAssistant ? 'bg-[#E6F7FF]' : ''}`}
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
                <div className="bg-[#f6f6f6] rounded-[4px] p-[6px] flex flex-row items-center">
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
                <div className="bg-[#f6f6f6] rounded-[4px] p-[4px] flex flex-row gap-[4px]">
                    <Image
                        src="sync-icon.svg"
                        width={16}
                        height={16}
                        draggable={false}
                        alt="sync"
                    />
                    <div className="flex flex-row items-center">
                        <div className="font-bold text-[12px] text-[#012f44]">
                            -2
                        </div>
                        <Image
                            src="energy-icon.svg"
                            width={20}
                            height={20}
                            draggable={false}
                            alt="audio"
                        />
                    </div>
                </div>
            </button>
        </CustomPopover>
    );
};

const LinkButton = function () {
    return (
        <CustomPopover tooltip="Sources">
            <button style={{pointerEvents: 'all'}}>
                <div className="bg-[#f6f6f6] rounded-[4px] p-[6px] flex flex-row gap-[4px]">
                    <Image
                        src="link-icon.svg"
                        width={16}
                        height={16}
                        draggable={false}
                        alt="sync"
                    />
                </div>
            </button>
        </CustomPopover>
    );
};

export default ChatHistory;
