import {fetchAPI} from '@/control/api';
import {AgentTTSRequestType, WebRequestType} from '@/interface/api';
import {Button, Icon, Spinner} from '@blueprintjs/core';
import {useRef} from 'react';

const AudioButton: React.FC<{
    agent: string;
    playingAudio: boolean;
    setPlayingAudio: (x: boolean) => void;
    startTalking: () => void;
    text: string;
}> = ({agent, playingAudio, setPlayingAudio, text, startTalking}) => {
    const playerRef = useRef<HTMLAudioElement | null>(null);

    const playAudio = async () => {
        setPlayingAudio(true);

        if (!playerRef.current) {
            console.log(`[INFO] Generating TTS for: ${text}`);
            const payload: AgentTTSRequestType = {
                agent,
                message: text,
            };
            const query: WebRequestType = {type: 'tts', task: payload};

            try {
                const data = await fetchAPI(query);
                const audioSrc = `data:audio/wav;base64,${data.result}`;
                playerRef.current = new Audio(audioSrc);
                playerRef.current.preload = 'auto';
                playerRef.current.addEventListener('ended', () =>
                    setPlayingAudio(false)
                );
            } catch (error) {
                console.error('Error fetching audio:', error);
                setPlayingAudio(false);
                return;
            }
        }

        if (playerRef.current) {
            startTalking();
            playerRef.current.play().catch(err => {
                console.error('Audio playback error:', err);
                setPlayingAudio(false);
            });
        }
    };
    return (
        <div className="w-[10%] flex justify-center items-center">
            <Button
                style={{pointerEvents: 'all'}}
                icon={
                    playingAudio ? (
                        <Spinner size={20} />
                    ) : (
                        <Icon icon="volume-up" color="white" />
                    )
                }
                variant="minimal"
                onClick={playAudio}
            />
        </div>
    );
};

export default AudioButton;
