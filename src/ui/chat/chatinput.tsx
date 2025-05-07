import {getCurrentTS} from '@/control/helper';
import {MsgType} from '@/interface/msg';
import Image from 'next/image';
import {useState, useRef} from 'react';

const UserInputPane: React.FC<{
    addMessage: (msg: MsgType) => void;
}> = function ({addMessage}) {
    const [msg, setMsg] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    function sendButtonClicked() {
        if (msg.trim() !== '') {
            addMessage({
                role: 'user',
                content: msg,
                timestamp: getCurrentTS(),
            });
            setMsg('');
        }
    }

    function checkSubmit(x: string) {
        if (x === 'Enter') {
            sendButtonClicked();
        }
    }

    const handleMicrophoneClick = () => {
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
                            setMsg(
                                prevMsg =>
                                    prevMsg + event.results[i][0].transcript
                            );
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
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
        }
    };

    return (
        <div className="h-[85px] flex items-center justify-center py-[11px] px-[16px] z-10">
            <div className="h-[38px] w-[100%] bg-[#051b29] rounded-[19px] flex gap-[10px] justify-center items-center py-[12px] pr-[4px] pl-[8px]">
                <input
                    className="flex-1 ml-[10px] bg-[#0000] placeholder:text-[rgba(132, 132, 132, 0.5)] text-left text-white"
                    style={{font: 'normal normal medium 11px/14px Montserrat'}}
                    value={msg}
                    onChange={x => setMsg(x.currentTarget.value)}
                    onKeyUp={x => checkSubmit(x.key)}
                    placeholder="Ask or say something..."
                />
                <div
                    className="w-[32px] bg-white h-[32px] rounded-[50%] flex justify-center items-center cursor-pointer"
                    onClick={handleMicrophoneClick}
                >
                    <div className="w-[20px] h-[20px] relative">
                        <Image
                            src={
                                isListening
                                    ? 'listening-icon.png'
                                    : 'microphone-icon.png'
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
                <div
                    className="w-[32px] h-[32px] bg-[#00a4f6] rounded-[50%] flex justify-center items-center cursor-pointer"
                    onClick={sendButtonClicked}
                >
                    <div className="w-[15px] h-[14px] relative">
                        <Image
                            src="send-icon.png"
                            fill
                            draggable={false}
                            alt="Send icon"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
/* Styled components */
export default UserInputPane;
