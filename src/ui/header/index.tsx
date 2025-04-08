import {WebWELLAgent} from '@/interface/agent';
import styled from 'styled-components';

const Header: React.FC<{agent: WebWELLAgent}> = function ({agent}) {
    return (
        <HeaderContainer>
            <CompanyLogo />
            <AgentContainer>
                <AgentName>{agent.meta.name}</AgentName>
            </AgentContainer>
        </HeaderContainer>
    );
};

/* Styled components */

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    background: transparent linear-gradient(360deg, #062e4500 0%, #062e45 100%)
        0% 0% no-repeat padding-box;
    opacity: 1;
    padding: 8px 0px 8px 16px;
`;

const CompanyLogo = styled.div`
    width: 200px;
    height: 24px;
    background: transparent url('wellaios-logo-small.png') 0% 0% no-repeat
        padding-box;
`;

const AgentContainer = styled.div`
    // width: 150px;
    height: 40px;
    background: #051b29 0% 0% no-repeat padding-box;
    border-radius: 16px 0px 0px 16px;
    opacity: 1;
    padding: 0px 16px 0px 24px;
    display: flex;
    align-items: center;
`;

const AgentName = styled.div`
    // width: 85px;
    height: 16px;
    text-align: left;
    font: normal normal strong 32px/42px Montserrat;
    letter-spacing: 0px;
    color: #ffffff;
    opacity: 1;
`;

export default Header;
