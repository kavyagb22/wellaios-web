import {AnimatePresence, motion} from 'framer-motion';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {Unity} from 'react-unity-webgl';
import {UnityProvider} from 'react-unity-webgl/distribution/types/unity-provider';

const UnityPane: React.FC<{
    profile: string;
    unityProvider: UnityProvider;
    isLoaded: boolean;
}> = function ({profile, unityProvider, isLoaded}) {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => setIsLoading(false), 3000);
        }
    }, [isLoaded]);

    return (
        <div className="flex-[3] relative">
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    borderRadius: '10px 10px 0px 0px',
                    backgroundRepeat: 'repeat',
                    backgroundOrigin: 'padding-box',
                }}
            >
                <Unity
                    className="w-[100%] h-[100%] bg-transparent"
                    unityProvider={unityProvider}
                />
            </div>
            <AnimatePresence>
                {isLoading && <LoadingPage profile={profile} />}
            </AnimatePresence>
        </div>
    );
};

const LoadingPage: React.FC<{profile: string}> = function ({profile}) {
    return (
        <motion.div
            exit={{opacity: 0}}
            className="absolute inset-0 rounded-[10px] m-[10px] bg-[lightgrey] flex justify-center items-center"
        >
            <div className="animate-bounce relative w-[150px] h-[150px] rounded-[50%] overflow-hidden">
                <Image src={profile} draggable={false} alt="AI Image" fill />
            </div>
        </motion.div>
    );
};

export default UnityPane;
