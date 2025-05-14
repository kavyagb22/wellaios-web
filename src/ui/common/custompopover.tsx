import {useRef, useState} from 'react';

const CustomPopover = ({
    children,
    tooltip,
}: {
    children: React.ReactNode;
    tooltip: string;
}) => {
    const [show, setShow] = useState(false);
    const timer = useRef<NodeJS.Timeout | null>(null);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => {
                if (timer.current) clearTimeout(timer.current);
                setShow(true);
            }}
            onMouseLeave={() => {
                timer.current = setTimeout(() => setShow(false), 100);
            }}
            onClick={e => {
                // Optional: prevent click from affecting tooltip visibility
                e.stopPropagation();
            }}
        >
            {/* Clone children to avoid pointer-events issues */}
            <div className="pointer-events-auto">{children}</div>
            {show && (
                <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 pointer-events-none">
                    <div className="relative">
                        <div className="bg-[#012F44] text-white text-[10px] px-1 py-1 rounded shadow-lg whitespace-nowrap">
                            {tooltip}
                        </div>
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-full">
                            <svg className="h-3 w-4" viewBox="0 0 20 10">
                                <polygon
                                    points="0,10 10,0 20,10"
                                    fill="#012F44"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomPopover;
