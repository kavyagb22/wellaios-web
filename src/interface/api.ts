import {LLMMsgType} from './msg';

export type RequestType = {
    type: 'web';
    query: WebRequestType;
};

export type WebRequestType =
    | {
          type: 'get_web_agent';
          task: AgentIDOnlyRequestType;
      }
    | {
          type: 'web_chat';
          task: WebChatRequestType;
      }
    | {
          type: 'tts';
          task: AgentTTSRequestType;
      }
    | {
          type: 'web_history';
          task: WebHistoryRequestType;
      }
    | {
          type: 'upload';
          task: UploadFileRequestType;
      };

export type WebHistoryRequestType = {
    agent: string;
    userid: string;
};

export type AgentIDOnlyRequestType = {
    agent: string;
};

export type WebChatRequestType = {
    agent: string;
    msgs: LLMMsgType[];
    userid?: string;
};

export type AgentTTSRequestType = {
    agent: string;
    message: string;
};

export type UploadFileRequestType = {
    filename: string;
    user: string;
};
