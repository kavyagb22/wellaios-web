export type MsgType = {
    role: ChatRoleType;
    content: string;
};

export type ChatRoleType = 'user' | 'assistant';
