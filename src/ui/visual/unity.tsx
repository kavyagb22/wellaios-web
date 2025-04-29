import Image from 'next/image';
import {useEffect, useState} from 'react';
import {Unity, useUnityContext} from 'react-unity-webgl';

const UnityPane: React.FC<{profile: string}> = function ({profile}) {
    const {unityProvider, sendMessage, isLoaded} = useUnityContext({
        loaderUrl: 'unity/unity.loader.js',
        dataUrl: 'unity/unity.data',
        frameworkUrl: 'unity/unity.framework.js',
        codeUrl: 'unity/unity.wasm',
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isLoaded) {
            setTimeout(() => setIsLoading(false), 3000);
        }
    }, [isLoaded]);

    return (
        <div className="flex-[3] relative">
            <div className="absolute inset-0 rounded-[10px] overflow-hidden m-[10px]">
                <Unity
                    className="w-[100%] h-[100%] bg-transparent"
                    unityProvider={unityProvider}
                />
            </div>
            {isLoading && <LoadingPage profile={profile} />}
        </div>
    );
};

const LoadingPage: React.FC<{profile: string}> = function ({profile}) {
    return (
        <div className="absolute inset-0 bg-[lightgrey] flex justify-center items-center">
            <div className="animate-bounce relative w-[150px] h-[150px] rounded-[50%] overflow-hidden">
                <Image src={profile} draggable={false} alt="AI Image" fill />
            </div>
        </div>
    );
};

export default UnityPane;
