import {MsgType} from '@/interface/msg';
import {useState} from 'react';
import styled from 'styled-components';

const UserInputPane: React.FC<{
    addMessage: (msg: MsgType) => void;
}> = function ({addMessage}) {
    const [msg, setMsg] = useState<string>('');

    function sendButtonClicked() {
        if (msg.trim() !== '') {
            addMessage({
                role: 'user',
                content: msg,
            });
            setMsg('');
        }
    }

    function checkSubmit(x: string) {
        if (x === 'Enter') {
            sendButtonClicked();
        }
    }

    return (
        <UserInputPaneContainer>
            <UserInputFieldPane>
                <UserInputField
                    value={msg}
                    onChange={x => setMsg(x.currentTarget.value)}
                    onKeyUp={x => checkSubmit(x.key)}
                    placeholder="Ask or say something..."
                />
                <SendButton onClick={sendButtonClicked}>
                    <SendIcon />
                </SendButton>
            </UserInputFieldPane>
        </UserInputPaneContainer>
    );
};

/* Styled components */

const UserInputPaneContainer = styled.div`
    height: 85px;
    background: #062e45 0% 0% no-repeat padding-box;
    opacity: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 16px;
`;

const UserInputFieldPane = styled.div`
    height: 38px;
    width: 100%;
    background: #051b29 0% 0% no-repeat padding-box;
    border-radius: 19px;
    opacity: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 4px 12px 8px;
`;

const UserInputField = styled.input`
    flex: 1;
    margin-left: 10px;
    background: none;
    border: none;
    width: 246px;
    height: 14px;
    text-align: left;
    font: normal normal medium 11px/14px Montserrat;
    font-size: 13px;
    letter-spacing: 0px;
    color: #ffffff;
    &::placeholder {
        color: rgba(132, 132, 132, 0.5);
    }
`;

const SendButton = styled.div`
    width: 32px;
    height: 32px;
    background: #00a4f6 0% 0% no-repeat padding-box;
    opacity: 1;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SendIcon = styled.div`
    width: 15px;
    height: 14px;
    background: transparent url('send-icon.png') 0% 0% no-repeat padding-box;
    opacity: 1;
`;

export default UserInputPane;
