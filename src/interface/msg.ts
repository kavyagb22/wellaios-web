export type MsgType = {
    role: ChatRoleType;
    content: string;
    timestamp: number;
};

export type ChatRoleType = 'user' | 'assistant';
