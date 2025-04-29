import {WebWELLAgent} from '@/interface/agent';
import Image from 'next/image';

const Header: React.FC<{agent: WebWELLAgent}> = function ({agent}) {
    return (
        <div className="w-[100%] flex justify-between items-center py-[8px] pl-[16px]">
            <CompanyLogo />
            <div
                style={{font: 'normal normal strong 32px/42px Montserrat'}}
                className="bg-[#051b29] min-w-[150px] h-[40px] z-10 text-white rounded-tl-[16px] rounded-bl-[16px] flex items-center pl-[16px] pr-[8px]"
            >
                <div>{agent.meta.name}</div>
            </div>
        </div>
    );
};

const CompanyLogo = () => (
    <div className="w-[145px] h-[24px] relative">
        <Image
            src="wellaios-logo.png"
            fill
            draggable={false}
            alt="Company logo"
        />
    </div>
);

export default Header;
