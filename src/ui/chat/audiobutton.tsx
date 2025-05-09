import {fetchAPI} from '@/control/api';
import {AgentTTSRequestType, WebRequestType} from '@/interface/api';
import {Button, Icon, Spinner} from '@blueprintjs/core';
import {useState} from 'react';
import {ReactUnityEventParameter} from 'react-unity-webgl/distribution/types/react-unity-event-parameters';

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
}> = ({
    agent,
    playingAudio,
    playingAnimation,
    playingActionAnimation,
    text,
    emotion,
    startTalking,
    sendMessage,
}) => {
    const [audio, setAudio] = useState<string | undefined>(undefined);

    const playAudio = async () => {
        if (!playingAudio) {
            startTalking();
            if (audio === undefined) {
                console.log(`[INFO] Generating TTS for: ${text}`);
                const payload: AgentTTSRequestType = {
                    agent,
                    message: text,
                };
                const query: WebRequestType = {type: 'tts', task: payload};

                try {
                    const data = await fetchAPI(query);
                    sendMessage('Kiki01', 'emotion', emotion);
                    setAudio(data.result);
                    sendMessage('Kiki01', 'speak', data.result);
                } catch (error) {
                    console.error('Error fetching audio:', error);
                    return;
                }
            } else {
                sendMessage('Kiki01', 'emotion', emotion);
                sendMessage('Kiki01', 'speak', audio);
            }
        }
    };
    return (
        <>
            {!playingAnimation && !playingActionAnimation && (
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
            )}
        </>
    );
};

export default AudioButton;
