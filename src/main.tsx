import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import Header from './ui/header';
import ChatPane from './ui/chat/pane';
import {AgentIDOnlyRequestType, WebRequestType} from './interface/api';
import {fetchAPI} from './control/api';
import {WebWELLAgent} from './interface/agent';
import {getImage} from './control/utils/image';
import {DEFAULT_IMAGES} from './config/constants';
import Image from 'next/image';

const MainPage: React.FC = function () {
    const router = useRouter();
    // const [agentId, setAgentId] = useState<string>('JbDtCsKAFpQKP6Ss');
    const [agent, setAgent] = useState<WebWELLAgent>();

    useEffect(() => {
        if (router.isReady) {
            const id = router.query.agentId;
            if (typeof id === 'string') {
                getAgentInfo(id);
            }
        }
    }, [router.isReady, router.query.agentId]);

    const getAgentInfo = async (id: string) => {
        const payload: AgentIDOnlyRequestType = {agent: id};
        const query: WebRequestType = {
            type: 'get_web_agent',
            task: payload,
        };
        const response = await fetchAPI(query);
        console.log('response: ', response);
        setAgent(response);
    };

    return (
        <>
            {agent && (
                <div
                    style={{
                        height: '100vh',
                        width: '100vw',
                        minWidth: '100vw',
                        overflow: 'hidden',
                        background: `transparent url("${getImage(agent.output.params.background, DEFAULT_IMAGES['bg'])}") center/cover no-repeat padding-box`,
                        backgroundSize: 'cover',
                        opacity: '1',
                        position: 'relative',
                    }}
                >
                    {' '}
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
                        <Image
                            src={getImage(
                                agent.output.params.agent_img,
                                DEFAULT_IMAGES['agent']
                            )}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{
                                height: '100vh',
                                width: 'auto',
                                objectFit: 'contain',
                            }}
                            alt="agent"
                        />
                    </div>
                    <ChatPane agent={agent} />
                </div>
            )}
        </>
    );
};

export default MainPage;
