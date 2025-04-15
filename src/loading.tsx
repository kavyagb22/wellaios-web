import {Spinner} from '@blueprintjs/core';

const LoadingPage: React.FC = function () {
    return (
        <div className="absolute w-[100%] h-[100%] flex justify-center items-center">
            <Spinner size={100} />
        </div>
    );
};

export default LoadingPage;
