import {useEffect, useState} from 'react';
import Header from './ui/header';
import ChatPane from './ui/chat/pane';
import {WebRequestType} from './interface/api';
import {fetchAPI} from './control/api';
import {WebWELLAgent} from './interface/agent';
import {getImage} from './control/utils/image';
import {DEFAULT_IMAGES} from './config/constants';
import Image from 'next/image';
import Avatar3D from './ui/model/avatar';
import LoadingPage from './loading';
import {useSearchParams} from 'next/navigation';
import NoAgentPage from './noagent';

function estimateSpeechDuration(message: string, wordsPerMinute = 150): number {
    if (!message) {
        return 0; // Handle empty messages
    }

    // 1. Split the message into words.  Handles multiple spaces and leading/trailing spaces.
    const words = message.trim().split(/\s+/);
    const numberOfWords = words.length;

    // 2. Calculate the estimated time in seconds.
    const estimatedTimeInSeconds = (numberOfWords * 60000) / wordsPerMinute;

    return estimatedTimeInSeconds;
}

const MainPage: React.FC = function () {
    const searchParams = useSearchParams();
    const aid = searchParams.get('agentId');
    const [talking, setTalking] = useState<number>(0);

    const [agent, setAgent] = useState<WebWELLAgent | null | undefined>(
        undefined
    );

    useEffect(() => {
        if (aid !== null) {
            getAgentInfo(aid);
        }
    }, [aid]);

    const getAgentInfo = (agent: string) => {
        const query: WebRequestType = {
            type: 'get_web_agent',
            task: {agent},
        };
        fetchAPI(query)
            .then(setAgent)
            .catch(x => {
                console.error(x);
                setAgent(null);
            });
    };

    const talk = function (msg: string) {
        console.log(`[INFO] Talking: ${talking}`);
        setTalking(t => t + 1);
        setTimeout(() => setTalking(t => t - 1), estimateSpeechDuration(msg));
    };

    return (
        <>
            {agent ? (
                <div
                    style={{
                        height: '100vh',
                        width: '100vw',
                        minWidth: '100vw',
                        overflow: 'hidden',
                        opacity: '1',
                        position: 'relative',
                    }}
                >
                    <Image
                        src={getImage(
                            agent.output.params.background,
                            DEFAULT_IMAGES['bg']
                        )}
                        fill
                        className="object-cover"
                        alt="Background"
                        draggable={false}
                    />
                    <Header agent={agent} />
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {agent.output.params.agent_img === '' ? (
                            <Avatar3D />
                        ) : (
                            <Image
                                src={getImage(
                                    agent.output.params.agent_img,
                                    DEFAULT_IMAGES['agent']
                                )}
                                fill
                                className="px-[2%] pt-[10%] object-contain"
                                alt="Agent"
                                draggable={false}
                            />
                        )}
                    </div>
                    <ChatPane agent={agent} talk={talk} />
                </div>
            ) : aid !== null && agent === undefined ? (
                <LoadingPage />
            ) : (
                <NoAgentPage />
            )}
        </>
    );
};

export default MainPage;
