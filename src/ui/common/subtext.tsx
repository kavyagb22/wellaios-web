import {ATTACHMENT_LIMIT} from '@/config/constants';

const SubText: React.FC<{type: string; value?: Number}> = ({
    type,
    value = 0,
}) => {
    let text: string;
    if (type === 'general') {
        text =
            'AI agents can slip up and make mistakes —always double-check critical details.';
    } else if (type === 'limit') {
        text = `Attachment limit ${value}/${ATTACHMENT_LIMIT}`;
    } else if (type === 'audio') {
        text = 'Make sure your browser allows the microphone input';
    } else if (type === 'guide') {
        text =
            'Leverage AI-generated context templates to guide the flow of your conversation.';
    } else {
        text =
            'AI agents can slip up and make mistakes —always double-check critical details.';
    }
    return <div className="text-[12px] text-[#9B9B9B]">{text}</div>;
};

export default SubText;
