import {fetchAPI} from '@/control/api';
import {getCurrentTS} from '@/control/helper';
import {UploadFileRequestType, WebRequestType} from '@/interface/api';
import {UploadResponse} from '@/interface/image';
import {MsgType} from '@/interface/msg';
import Image from 'next/image';
import {useState, useRef} from 'react';

const UserInputPane: React.FC<{
    addMessage: (msg: MsgType) => void;
    uid: string | null;
}> = function ({addMessage, uid}) {
    const [msg, setMsg] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    async function sendButtonClicked() {
        if (loading) return; // Prevent double click

        setLoading(true);
        try {
            let imageUrl: string | null = null;

            if (selectedFile) {
                const task: UploadFileRequestType = {
                    user: uid ?? 'anonymous',
                    filename: selectedFile.name,
                };

                const payload: WebRequestType = {type: 'upload', task};
                const response: UploadResponse = await fetchAPI(payload);

                await fetch(response.url, {
                    method: 'PUT',
                    headers: {'Content-Type': response.contentType},
                    body: selectedFile,
                });

                imageUrl = 'https://img.wellaios.ai/' + response.key;
            }

            const trimmedText = msg.trim();
            const messageContent: MsgType['content'] = [];

            if (trimmedText !== '') {
                messageContent.push({type: 'text', text: trimmedText});
            }

            if (imageUrl) {
                messageContent.push({
                    type: 'image_url',
                    image_url: {url: imageUrl},
                });
            }

            if (messageContent.length > 0) {
                addMessage({
                    role: 'user',
                    content: messageContent,
                    timestamp: getCurrentTS(),
                });
            }

            // Reset form
            setMsg('');
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setLoading(false);
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
        }
    };

    const handleRemovePreview = () => {
        setPreviewUrl(null);
        setSelectedFile(null);
        // Optionally, you might want to handle cancelling the upload here if it's in progress
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    return (
        <div className="h-auto flex flex-col gap-0 items-center justify-center py-[11px] px-[16px] z-10">
            <div className=" w-[100%] bg-[#051b29] rounded-[19px] flex flex-col gap-[10px] py-[4px] pr-[4px] pl-[8px]">
                {previewUrl && (
                    <div className="w-full mb-2 ml-[10px] flex justify-start  bg-[#051b29] py-[12px]">
                        <img
                            src={previewUrl}
                            alt="Image preview"
                            className="max-h-[70px] max-w-[70px] rounded-md border border-gray-600"
                        />
                        <div
                            onClick={handleRemovePreview}
                            className="bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-700 cursor-pointer"
                            title="Remove image"
                        >
                            &times;
                        </div>
                    </div>
                )}
                <div className="flex flex-row gap-[10px] justify-center items-center">
                    <input
                        className="flex-1 ml-[10px] bg-[#051b29] placeholder:text-[rgba(132, 132, 132, 0.5)] text-left text-white"
                        style={{
                            font: 'normal normal medium 11px/14px Montserrat',
                        }}
                        value={msg}
                        onChange={x => setMsg(x.currentTarget.value)}
                        onKeyUp={x => checkSubmit(x.key)}
                        placeholder="Ask or say something..."
                    />

                    <input
                        type="file"
                        accept="image/*" // change to accept="*" for all file types
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                    />
                    <div
                        className="w-[32px] bg-white h-[32px] rounded-[50%] flex justify-center items-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file"
                    >
                        <div className="w-[20px] h-[20px] relative">
                            <Image
                                src="clip-icon.png"
                                fill
                                draggable={false}
                                alt="Clip icon"
                            />
                        </div>
                    </div>

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
                        {loading ? (
                            <div className="w-[18px] h-[18px] animate-spin border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <div className="w-[15px] h-[14px] relative">
                                <Image
                                    src="send-icon.png"
                                    fill
                                    draggable={false}
                                    alt="Send icon"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
/* Styled components */
export default UserInputPane;
