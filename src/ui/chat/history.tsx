import {Card, Spinner} from '@blueprintjs/core';
import {useEffect, useRef} from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';
import {ChatRoleType, MsgType} from '@/interface/msg';
import {WebWELLAgent} from '@/interface/agent';
import {DEFAULT_IMAGES} from '@/config/constants';
import {getMediaWithDefault} from '@/control/utils/media';

const ChatHistory: React.FC<{
    history: MsgType[];
    agent: WebWELLAgent;
}> = function ({history, agent}) {
    const chatWinDiv = useRef<HTMLDivElement | null>(null);
    const userPic = getMediaWithDefault(
        agent.meta.profile,
        DEFAULT_IMAGES['profile']
    );

    useEffect(() => {
        if (chatWinDiv.current) {
            chatWinDiv.current.scrollTop = chatWinDiv.current.scrollHeight;
        }
    }, [history]);

    return (
        <ChatHistoryContainer ref={chatWinDiv}>
            <ChatHistoryListPane>
                {history === undefined ? (
                    <Spinner />
                ) : (
                    history.map((x, i) => (
                        <ChatItem key={i} item={x} userPic={userPic} />
                    ))
                )}
            </ChatHistoryListPane>
        </ChatHistoryContainer>
    );
};

const ChatItem: React.FC<{
    item: MsgType;
    userPic?: string;
}> = function ({item, userPic}) {
    const itemRef = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={itemRef}
            style={{
                display: 'flex',
                margin: 2,
                paddingLeft: 10,
                paddingRight: 10,
                position: 'relative',
                justifyContent: MsgCardJustifySettings[item.role],
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: 1,
                transition: 'opacity 0.2s ease-out',
            }}
        >
            {item.role === 'assistant' ? (
                <>
                    <MsgIcon $msgrole={item.role} $userPic={userPic} />
                    <MsgCard $msgrole={item.role}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Markdown
                                components={{
                                    strong: props => (
                                        <MsgBold>{props.children}</MsgBold>
                                    ),
                                    a: props => (
                                        <a
                                            href={props.href}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {props.children}
                                        </a>
                                    ),
                                    p: props => (
                                        <MsgItem>{props.children}</MsgItem>
                                    ),
                                }}
                            >
                                {item.content}
                            </Markdown>
                        </div>
                    </MsgCard>
                </>
            ) : (
                <>
                    <MsgCard $msgrole={item.role}>
                        <Markdown
                            components={{
                                strong: props => (
                                    <MsgBold>{props.children}</MsgBold>
                                ),
                                a: props => (
                                    <a
                                        href={props.href}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {props.children}
                                    </a>
                                ),
                                p: props => <MsgItem>{props.children}</MsgItem>,
                            }}
                        >
                            {item.content}
                        </Markdown>
                    </MsgCard>
                    <MsgIcon $msgrole={item.role} />
                </>
            )}
        </div>
    );
};

const MsgCardJustifySettings: Record<ChatRoleType, string> = {
    assistant: 'left',
    user: 'right',
};

const itemCSS: Record<ChatRoleType, string> = {
    assistant: `
        text-align: left;
        max-width: 90%;
        color: #FFFFFF;
        background: #00A4F6 0% 0% no-repeat padding-box;
        border-radius: 8px;
        opacity: 0.85;
        font: normal normal medium 11px/15px Montserrat;
        margin-left: 6px;
    `,
    user: `
        text-align: left;
        max-width: 90%;
        background: #D4D4D4 0% 0% no-repeat padding-box;
        border-radius: 8px;
        opacity: 0.85;
        font: normal normal medium 11px/15px Montserrat;
        margin-right: 6px;
    `,
};

/* Styled components */

const ChatHistoryContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    padding-top: 10px;
    z-index: 4;
    touch-action: auto;
    background: transparent linear-gradient(180deg, #062e4500 0%, #062e45 100%)
        0% 0% no-repeat padding-box;
    opacity: 1;
    width: 100%;
    min-width: 100%;
    height: 299px;
    align-items: center;
    position: relative;

    /* This creates a fade effect at the top */
    -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 1) 30%
    );
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 1) 30%
    );
`;

const ChatHistoryListPane = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    width: 100%;
    padding: 0px 8px;
`;

const MsgCard = styled(Card)<{$msgrole: ChatRoleType}>`
    border-radius: 10px;
    overflow-wrap: break-word;
    margin: 2px;
    padding: 10px;
    pointer-events: none;
    touch-action: none;
    font-size: 13px;
    ${({$msgrole}) => itemCSS[$msgrole]}
`;

const MsgIcon = styled.div<{$msgrole: ChatRoleType; $userPic?: string}>`
    flex-shrink: 0;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    background: ${({$userPic, $msgrole}) =>
        $userPic
            ? `url(${$userPic}) top/cover no-repeat`
            : $msgrole === 'assistant'
              ? `transparent url(${DEFAULT_IMAGES['profile']}) center/cover no-repeat`
              : "#CFCFCF url('placeholder-icon.png') center/cover no-repeat"};
    opacity: 1;
`;

const MsgBold = styled.b`
    color: #ffffff;
`;

const MsgItem = styled.p`
    margin: 0px;
`;

export default ChatHistory;
