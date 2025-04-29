import {useEffect, useState} from 'react';
import Header from './ui/header';
import ChatPane from './ui/chat/pane';
import {WebRequestType} from './interface/api';
import {fetchAPI} from './control/api';
import {WebWELLAgent} from './interface/agent';
import {DEFAULT_IMAGES} from './config/constants';
import Image from 'next/image';
import LoadingPage from './loading';
import {useSearchParams} from 'next/navigation';
import NoAgentPage from './noagent';
import {getMediaWithDefault} from './control/utils/media';

const MainPage: React.FC = function () {
    const searchParams = useSearchParams();
    const aid = searchParams.get('agentId');

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

    return (
        <>
            {agent ? (
                <div className="h-[100vh] w-[100vw] min-w-[100vw] relative">
                    <div className="absolute inset-0">
                        <Image
                            src={getMediaWithDefault(
                                agent.dna.background,
                                DEFAULT_IMAGES['bg']
                            )}
                            fill
                            className="object-cover"
                            alt="Background"
                            draggable={false}
                        />
                    </div>
                    <div className="absolute flex flex-col inset-0">
                        <Header agent={agent} />
                        <ChatPane agent={agent} />
                    </div>
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
