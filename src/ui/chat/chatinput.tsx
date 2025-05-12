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
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    async function sendButtonClicked() {
        if (loading) return; // Prevent double click

        setLoading(true);
        try {
            const imageUrls: string[] = [];

            if (selectedFiles && selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const task: UploadFileRequestType = {
                        user: uid ?? 'anonymous',
                        filename: file.name,
                    };

                    const payload: WebRequestType = {type: 'upload', task};
                    const response: UploadResponse = await fetchAPI(payload);

                    await fetch(response.url, {
                        method: 'PUT',
                        headers: {'Content-Type': response.contentType},
                        body: file,
                    });

                    imageUrls.push('https://img.wellaios.ai/' + response.key);
                }
            }

            const trimmedText = msg.trim();
            const messageContent: MsgType['content'] = [];

            if (trimmedText !== '') {
                messageContent.push({type: 'text', text: trimmedText});
            }

            if (imageUrls.length > 0) {
                imageUrls.forEach(url => {
                    messageContent.push({
                        type: 'image_url',
                        image_url: {url: url},
                    });
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
            setSelectedFiles([]);
            setPreviewUrls([]);
            if (inputRef.current) {
                inputRef.current.style.height = 'auto'; // Reset height
            }
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

    const handleRemovePreview = (indexToRemove: number) => {
        setPreviewUrls(prevUrls =>
            prevUrls.filter((_, index) => index !== indexToRemove)
        );
        setSelectedFiles(prevFiles =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
        // Optionally, you might want to handle cancelling the upload here if it's in progress
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);

        // Reset the input value so that the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMsg(e.currentTarget.value);
        // Adjust height based on content
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className="h-auto flex flex-col gap-0 items-center justify-center py-[11px] px-[16px] z-10">
            <div className=" w-[100%] bg-[#F5F5F5] rounded-[16px] flex flex-col gap-[10px] py-[6px] pr-[4px] pl-[8px]">
                <div className="flex flex-row gap-[8px] justify-center items-end">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                        multiple // Add the 'multiple' attribute to allow multiple file selection
                    />
                    <div
                        className="w-[32px] h-[32px] flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px]"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file"
                    >
                        <div className="w-[20px] h-[20px] relative">
                            <Image
                                src="attachment.svg"
                                fill
                                draggable={false}
                                alt="Attachment icon"
                            />
                        </div>
                    </div>
                    <textarea
                        ref={inputRef}
                        className="flex-1  items-center px-2 placeholder:text-[rgba(132, 132, 132, 0.5)] text-left border-[#67677466] border-[1px] rounded-[12px]"
                        style={{
                            font: 'normal normal medium 11px/14px Montserrat',
                            overflowY: 'auto',
                            resize: 'none',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '300px', // Adjust this value as needed
                        }}
                        value={msg}
                        onChange={e => handleInputChange(e)}
                        onKeyUp={x => checkSubmit(x.key)}
                        placeholder="Say something to *Avatar Name*"
                    />

                    <div
                        className={`flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px] ${msg.trim() === '' && selectedFiles.length === 0 ? '' : 'bg-[#012F44]'}`}
                        onClick={sendButtonClicked}
                    >
                        {loading ? (
                            <div className="w-[18px] h-[18px] animate-spin border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <div>
                                {msg.trim() === '' &&
                                selectedFiles.length === 0 ? (
                                    <div className="w-[30px] h-[30px] flex items-center justify-center">
                                        <Image
                                            src="suggestion-icon.svg"
                                            width={20}
                                            height={20}
                                            draggable={false}
                                            alt="Send icon"
                                        />
                                    </div>
                                ) : (
                                    <div className=" rounded-[4px] p-[4px] flex flex-row gap-[6px]">
                                        <Image
                                            src="send-icon.svg"
                                            width={20}
                                            height={20}
                                            draggable={false}
                                            alt="Send icon"
                                        />
                                        <div className="flex flex-row items-center gap-[4px]">
                                            <div className=" text-[12px] text-white">
                                                -5
                                            </div>
                                            <Image
                                                src="energy-icon-white.svg"
                                                width={18}
                                                height={18}
                                                draggable={false}
                                                alt="audio"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                </div>
                {previewUrls.length > 0 && (
                    <div
                        style={{
                            scrollbarWidth: 'thin' /* For Firefox */,
                            scrollbarColor:
                                '#a0aec0 #edf2f7' /* For Firefox (thumb track) */,

                            overflowY:
                                'hidden' /* Ensure no vertical scrollbar interferes */,
                            paddingBottom:
                                '8px' /* Add some padding to make space for the scrollbar */,
                        }}
                        className="w-full mb-2 flex gap-[8px] justify-start bg-[#F5F5F5] overflow-x-auto"
                    >
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                                <div className="border-[1px] border-[#b2b3b3] rounded-[8px] p-[2px] mt-[8px]">
                                    <img
                                        src={url}
                                        alt={`Image preview ${index + 1}`}
                                        className="min-w-[48px] max-w-[48px] h-[48px] rounded-md object-cover object-center"
                                    />
                                </div>
                                <div
                                    onClick={() => handleRemovePreview(index)}
                                    className="absolute top-0 -right-2 bg-[#012f44] rounded-[4px] border-[1px] border-[#f6f6f6] w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white cursor-pointer "
                                    title="Remove image"
                                >
                                    <Image
                                        src="close-icon.svg"
                                        width={12}
                                        height={12}
                                        draggable={false}
                                        alt="Remove icon"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
/* Styled components */
export default UserInputPane;
