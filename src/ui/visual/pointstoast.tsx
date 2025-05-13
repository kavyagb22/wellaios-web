import Image from 'next/image';
import React, {useEffect, useState} from 'react';

interface PointsToastProps {
    points: number;
    onClose: () => void;
}

const PointsToast: React.FC<PointsToastProps> = ({points, onClose}) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div
            className={`fixed top-2 left-1/3 flex
            flex-row gap-[4px] 
            items-center bg-[#fff3e3] text-[14px]
            text-[#e38800] px-[36px] py-2 rounded-[8px] 
             animate-fade-in-out`}
        >
            {' '}
            <div className="flex items-center border-[1px] rounded-full border-[#e38800] p-[1.5px]">
                <div className="bg-[#e38800] rounded-full flex items-center">
                    <Image
                        src="atom-icon.svg"
                        width={16}
                        height={16}
                        draggable={false}
                        alt="Atom"
                    />
                </div>
            </div>
            +{points} Points
        </div>
    );
};

export default PointsToast;
