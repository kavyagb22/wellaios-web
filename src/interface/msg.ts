export type LLMCompositeMsg =
    | {
          type: 'text';
          text: string;
      }
    | {
          type: 'image_url';
          image_url: {
              url: string;
          };
      };

export type LLMMsgType = {
    role: ChatRoleType;
    content: string | LLMCompositeMsg[];
};

export type MsgType = CoreMsg & {content: string; timestamp: number};

type CoreMsg = UserCoreMsg | AICoreMsg;

type UserCoreMsg = {
    role: 'user';
};

type AICoreMsg = {
    role: 'assistant';
    emotion: 'happy' | 'sad' | 'angry' | 'shy';
};

export type ChatRoleType = MsgType['role'];
