import {fetchAPI} from '@/control/api';
import {AgentTTSRequestType, WebRequestType} from '@/interface/api';
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {ReactUnityEventParameter} from 'react-unity-webgl/distribution/types/react-unity-event-parameters';
import CustomPopover from '@/ui/common/custompopover';

const MAX_VOLUME = 100;

const AudioButton: React.FC<{
    agent: string;
    playingAudio: boolean;
    playingAnimation: boolean;
    playingActionAnimation: boolean;
    startTalking: () => void;
    text: string;
    emotion: string;
    sendMessage: (
        gameobj: string,
        method: string,
        params: ReactUnityEventParameter
    ) => void;
    globalVolume: number;
    onGlobalVolumeChange: (volume: number) => void;
    isActive: boolean;
    disabled: boolean;
    onStop: () => void;
}> = ({
    agent,
    playingAudio,
    playingAnimation,
    playingActionAnimation,
    text,
    emotion,
    startTalking,
    sendMessage,
    globalVolume,
    onGlobalVolumeChange,
    isActive,
    disabled,
    onStop,
}) => {
    const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
    // const [volume, setVolume] = useState(MAX_VOLUME); // 0 - 100
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Handle audio play logic
    const playAudio = async () => {
        if (disabled) return;
        if (!playingAudio) {
            startTalking();
            if (!audioUrl) {
                const payload: AgentTTSRequestType = {agent, message: text};
                const query: WebRequestType = {type: 'tts', task: payload};

                try {
                    const data = await fetchAPI(query);
                    setAudioUrl(data.result);

                    sendMessage('Kiki01', 'emotion', emotion);
                    sendMessage('Kiki01', 'speak', data.result);
                    audioRef.current?.play();
                } catch (error) {
                    console.error('Error fetching audio:', error);
                }
            } else {
                sendMessage('Kiki01', 'emotion', emotion);
                sendMessage('Kiki01', 'speak', audioUrl);
                audioRef.current?.play();
            }
        }
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        onGlobalVolumeChange(newVolume); // Update global volume
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    // Update audio volume when it changes
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = globalVolume / MAX_VOLUME;
        }
    }, [globalVolume, audioUrl]);

    const stopAudioAndAnimation = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        sendMessage('Kiki01', 'stopSpeak', ''); // Tell Unity to stop speaking
        sendMessage('Kiki01', 'stopAnimation', ''); // Tell Unity to stop any animation
        onStop(); // Reset activeAudioIndex
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            sendMessage('Kiki01', 'stopSpeak', '');
            sendMessage('Kiki01', 'stopAnimation', '');
            onStop(); // reset activeAudioIndex
        };

        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onStop, sendMessage]);

    return (
        <CustomPopover tooltip="Read aloud">
            {!playingAnimation && !playingActionAnimation && (
                <div className="flex gap-[4px] bg-[#f6f6f6] rounded-[4px] ">
                    {/* Audio play button logic */}
                    <button
                        style={{
                            pointerEvents: disabled ? 'none' : 'all',
                            opacity: disabled ? 0.4 : 1,
                        }}
                        onClick={playAudio}
                        disabled={disabled}
                    >
                        {isActive && playingAudio ? (
                            // <Spinner size={16} />
                            <button
                                style={{pointerEvents: 'all'}}
                                onClick={playAudio}
                            >
                                <div className="p-[4px]">
                                    <Image
                                        src="stop-icon.svg"
                                        width={16}
                                        height={16}
                                        draggable={false}
                                        alt="stop"
                                        onClick={stopAudioAndAnimation}
                                    />
                                </div>
                            </button>
                        ) : (
                            <div className="bg-[#f6f6f6] rounded-[4px] p-[4px] flex flex-row gap-[4px]">
                                <Image
                                    src="audio-icon.svg"
                                    width={16}
                                    height={16}
                                    draggable={false}
                                    alt="audio"
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
                        )}
                    </button>

                    {/* Volume control visible only when audio is playing */}
                    {isActive && playingAudio && (
                        <div className="flex items-center gap-[6px] pr-[8px]">
                            <input
                                type="range"
                                min={0}
                                max={MAX_VOLUME}
                                value={globalVolume}
                                onChange={handleVolumeChange}
                                className=" w-full accent-[#036795] "
                                style={{height: '4px'}}
                            />

                            <Image
                                src="sound-icon.svg"
                                width={16}
                                height={16}
                                draggable={false}
                                alt="stop"
                            />
                            <span className="text-[#00121B] text-[12px]">
                                {globalVolume}
                            </span>
                        </div>
                    )}

                    {/* Audio element */}
                    {audioUrl && <audio ref={audioRef} src={audioUrl} />}
                </div>
            )}
        </CustomPopover>
    );
};

export default AudioButton;
