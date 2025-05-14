import Image from 'next/image';
import {useState, useRef} from 'react';

const MicrophoneButton: React.FC<{
    setMsg: (msg: string) => void;
    setSubTextType: (subTextType: string) => void;
}> = ({setMsg, setSubTextType}) => {
    const [msg, setLocalMsg] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const handleMicrophoneClick = () => {
        setSubTextType('audio');
        if (!recognitionRef.current) {
            // Initialize SpeechRecognition only if it's not already initialized
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onstart = () => {
                    setIsListening(true);
                };

                recognitionRef.current.onresult = event => {
                    let interimTranscript = '';
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        ++i
                    ) {
                        if (event.results[i].isFinal) {
                            const newMsg = msg + event.results[i][0].transcript;
                            setLocalMsg(newMsg);
                            setMsg(newMsg); // pass updated string to parent
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    console.log('interimTranscript', interimTranscript);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onerror = event => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };
            } else {
                alert('Your browser does not support Speech Recognition.');
            }
        }

        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
        } else if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setSubTextType('general');
        }
    };
    return (
        <div
            className="w-[32px] h-[32px] flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px]"
            onClick={handleMicrophoneClick}
        >
            <div className="w-[20px] h-[20px] relative">
                <Image
                    src={
                        isListening
                            ? 'listening-icon.png'
                            : 'microphone-icon.svg'
                    }
                    fill
                    draggable={false}
                    alt={
                        isListening
                            ? 'Listening microphone icon'
                            : 'Microphone icon'
                    }
                />
            </div>
        </div>
    );
};

export default MicrophoneButton;
