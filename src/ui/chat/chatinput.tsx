import {fetchAPI} from '@/control/api';
import {getCurrentTS} from '@/control/helper';
import {UploadFileRequestType, WebRequestType} from '@/interface/api';
import {UploadResponse} from '@/interface/image';
import {MsgType} from '@/interface/msg';
import Image from 'next/image';
import {useState, useRef} from 'react';

const IMG_URL = 'https://img.wellaios.ai/';

const UserInputPane: React.FC<{
    addMessage: (msg: MsgType) => void;
    uid: string | null;
}> = function ({addMessage, uid}) {
    const [msg, setMsg] = useState('');
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const [attachFile, setAttachFile] = useState<boolean>(false);

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

                    imageUrls.push(IMG_URL + response.key);
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

    return (
        <div className="h-auto flex flex-col gap-0 items-center justify-center py-[11px] px-[16px] z-10">
            <div className=" w-[100%] bg-[#F5F5F5] rounded-[16px] flex flex-col gap-[10px] py-[6px] pr-[4px] pl-[8px]">
                <div className="flex flex-row gap-[8px] justify-center items-end">
                    {attachFile ? (
                        <>
                            <AttachButton
                                setAttachFile={setAttachFile}
                                setPreviewUrls={setPreviewUrls}
                                setSelectedFiles={setSelectedFiles}
                            />
                        </>
                    ) : (
                        <>
                            <div
                                className="w-[32px] h-[32px] flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px]"
                                onClick={() => setAttachFile(true)}
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
                            <UserInputField
                                sendButtonClicked={sendButtonClicked}
                                inputRef={inputRef}
                                msg={msg}
                                setMsg={setMsg}
                            />

                            <SendButton
                                sendButtonClicked={sendButtonClicked}
                                loading={loading}
                                msg={msg}
                                selectedFiles={selectedFiles}
                            />
                            <MicrophoneButton setMsg={setMsg} />
                        </>
                    )}
                </div>
                {previewUrls.length > 0 && (
                    <PreviewList
                        previewUrls={previewUrls}
                        setPreviewUrls={setPreviewUrls}
                        setSelectedFiles={setSelectedFiles}
                        selectedFiles={selectedFiles}
                    />
                )}
            </div>
        </div>
    );
};

const AttachButton: React.FC<{
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setAttachFile: (attachFile: boolean) => void;
}> = ({setPreviewUrls, setSelectedFiles, setAttachFile}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [acceptType, setAcceptType] = useState<string>('');

    const handleFileTypeClick = (type: (typeof fileTypes)[0]) => {
        setAcceptType(type.accept);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
        setSelectedFiles(prevSelected => [...prevSelected, ...files]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileTypes: {name: string; icon: string; accept: string}[] = [
        {
            name: 'Image',
            icon: 'image-icon.svg',
            accept: 'image/*',
        },

        {
            name: 'PDF',
            icon: 'pdf-icon.svg',
            accept: 'application/pdf',
        },
        {
            name: 'TXT',
            icon: 'text-icon.svg',
            accept: 'text/plain',
        },
        {
            name: 'MP3',
            icon: 'audio-icon.svg',
            accept: 'audio/mpeg',
        },
        {
            name: 'Youtube',
            icon: 'youtube-icon.svg',
            accept: 'url',
        },
        {
            name: 'Website',
            icon: 'website-icon.svg',
            accept: 'url',
        },
    ];

    return (
        <>
            <div className="flex flex-col py-[4px] mr-[4px] gap-[12px] items-center justify-center w-full">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={acceptType}
                    style={{display: 'none'}}
                    multiple
                />
                <div className="flex flex-row justify-between items-center w-[100%]">
                    <div className="flex flex-row gap-[4px] items-center">
                        <Image
                            src="attachment-icon-blue.svg"
                            width={20}
                            height={20}
                            draggable={false}
                            alt="Attachment icon"
                        />
                        <span className="text-[12px] text-[#676774]">
                            Attach a file or URL:
                        </span>
                    </div>
                    <div
                        className="border-[1px] border-[#67677466] rounded-full p-[1px] cursor-pointer"
                        onClick={() => setAttachFile(false)}
                    >
                        <Image
                            src="close-icon-white.svg"
                            width={20}
                            height={20}
                            draggable={false}
                            alt="Attachment icon"
                        />
                    </div>
                </div>
                <FileTypeButton
                    fileTypes={fileTypes}
                    handleFileTypeClick={handleFileTypeClick}
                />
            </div>
        </>
    );
};

const FileTypeButton: React.FC<{
    fileTypes: {name: string; icon: string; accept: string}[];
    handleFileTypeClick: (type: {
        name: string;
        icon: string;
        accept: string;
    }) => void;
}> = ({fileTypes, handleFileTypeClick}) => {
    return (
        <div className="flex flex-row justify-between w-full gap-[12px]">
            {fileTypes.map((type, index) => (
                <button
                    className={`py-[6px] px-[12px] flex flex-row gap-[4px] items-center justify-center border-[1px] border-[#67677466] rounded-[12px] ${
                        type.name === 'Youtube' || type.name === 'Website'
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                    }`}
                    key={index}
                    onClick={() => handleFileTypeClick(type)}
                    disabled={
                        type.name === 'Youtube' || type.name === 'Website'
                    }
                >
                    <Image
                        src={type.icon}
                        width={20}
                        height={20}
                        draggable={false}
                        alt="Icon"
                    />
                    <span className="text-[12px] text-[#676774]">
                        {type.name}
                    </span>
                </button>
            ))}
        </div>
    );
};

const PreviewList: React.FC<{
    previewUrls: string[];
    selectedFiles: File[];
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}> = ({previewUrls, setPreviewUrls, setSelectedFiles, selectedFiles}) => {
    const handleRemovePreview = (indexToRemove: number) => {
        setPreviewUrls(prevUrls =>
            prevUrls.filter((_, index) => index !== indexToRemove)
        );
        setSelectedFiles(prevFiles =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
        // Optionally, you might want to handle cancelling the upload here if it's in progress
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    return (
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
            {previewUrls.map((url, index) => {
                const file = selectedFiles[index];
                const isImage = file?.type.startsWith('image/');
                const isPdf = file?.type === 'application/pdf';
                const isText = file?.type === 'text/plain';
                const isMp3 = file?.type === 'audio/mpeg';

                return (
                    <div key={index} className="relative">
                        <div
                            className={`border-[1px] border-[#b2b3b3] rounded-[8px]  mt-[8px] ${isImage ? 'w-[48px]' : 'p-[2px]'} h-[48px] flex items-center justify-center bg-white`}
                        >
                            {isImage ? (
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="p-[4px] min-w-[48px] max-w-[48px] h-[48px] rounded-md object-cover object-center"
                                />
                            ) : (
                                <div className="flex px-[1px] flex-row gap-[4px] items-center justify-center text-center">
                                    <div
                                        className={` min-w-[40px] max-w-[40px] h-[40px] p-[8px] rounded-[4px] ${isPdf ? 'bg-[#DBEEFF]' : isText ? 'bg-[#F1F1F1]' : isMp3 ? 'bg-[#FFF3DB]' : 'bg-[#DBFFF3]'}`}
                                    >
                                        <Image
                                            src={
                                                isPdf
                                                    ? 'file-blue.svg'
                                                    : isText
                                                      ? 'text-icon.svg'
                                                      : isMp3
                                                        ? 'audio-icon.svg'
                                                        : ''
                                            }
                                            width={24}
                                            height={24}
                                            alt="File icon"
                                        />
                                    </div>
                                    <div className="flex flex-col align-left text-left">
                                        <span className="text-[12px] min-w-[90px] max-w-[120px] truncate text-[#676774]">
                                            {file?.name}
                                        </span>
                                        <span className="flex flex-row gap-[6px] items-center text-[12px] text-[#9b9b9b]">
                                            <div>
                                                {' '}
                                                {isPdf
                                                    ? 'PDF'
                                                    : isText
                                                      ? 'TXT'
                                                      : isMp3
                                                        ? 'MP3'
                                                        : ''}
                                            </div>
                                            <div className="rounded-full w-[4px] h-[4px] bg-[#9B9B9B]" />
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div
                            onClick={() => handleRemovePreview(index)}
                            className="absolute top-0 -right-2 bg-[#012f44] rounded-[4px] border-[1px] border-[#f6f6f6] w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white cursor-pointer"
                            title="Remove file"
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
                );
            })}
        </div>
    );
};

const MicrophoneButton: React.FC<{
    setMsg: (msg: string) => void;
}> = ({setMsg}) => {
    const [msg, setLocalMsg] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
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

const SendButton: React.FC<{
    sendButtonClicked: () => void;
    loading: boolean;
    msg: string;
    selectedFiles: File[];
}> = ({sendButtonClicked, loading, msg, selectedFiles}) => {
    return (
        <div
            className={`flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px] ${msg.trim() === '' && selectedFiles.length === 0 ? '' : 'bg-[#012F44]'}`}
            onClick={sendButtonClicked}
        >
            {loading ? (
                <div className="w-[18px] h-[18px] animate-spin border-2 border-white border-t-transparent rounded-full" />
            ) : (
                <div>
                    {msg.trim() === '' && selectedFiles.length === 0 ? (
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
    );
};

const UserInputField: React.FC<{
    sendButtonClicked: () => void;
    inputRef: any;
    msg: string;
    setMsg: (msg: string) => void;
}> = ({sendButtonClicked, inputRef, msg, setMsg}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMsg(e.currentTarget.value);
        // Adjust height based on content
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    };
    function checkSubmit(x: string) {
        if (x === 'Enter') {
            sendButtonClicked();
        }
    }
    return (
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
    );
};

export default UserInputPane;
