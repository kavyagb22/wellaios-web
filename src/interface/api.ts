import {MsgType} from './msg';

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
      };

export type AgentIDOnlyRequestType = {
    agent: string;
};

export type WebChatRequestType = {
    agent: string;
    msgs: MsgType[];
};
