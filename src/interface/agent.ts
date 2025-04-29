export type WebWELLAgent = {
    id: string;
    meta: AgentMetaType;
    dna: AgentDNA;
};

export type AgentMetaType = {
    description: string;
    name: string;
    profile: string;
};

export type OutputParamsType = {
    agent_img: string;
    background: string;
};

export type AgentDNA = {
    persona: string;
    instruction: string;
    background: string;
    outlook_type: string;
    outlook: string;
};
