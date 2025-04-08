export type WebWELLAgent = {
    id: string;
    meta: AgentMetaType;
    output: AgentOutputType;
};

export type AgentMetaType = {
    description: string;
    name: string;
    profile: string;
};

export type AgentOutputType = {
    mode: 'web';
    params: OutputParamsType;
};

export type OutputParamsType = {
    agent_img: string;
    background: string;
};
