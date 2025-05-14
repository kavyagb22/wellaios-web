import {fetchAPI} from '@/control/api';
import {getCurrentTS} from '@/control/helper';
import {UploadFileRequestType, WebRequestType} from '@/interface/api';
import {UploadResponse} from '@/interface/image';
import {MsgType} from '@/interface/msg';
import Image from 'next/image';
import {useState, useRef} from 'react';
import PointsToast from '../common/pointstoast';
import AttachButton from './input/attachbutton';
import PreviewList from './input/imagepreview';
import MicrophoneButton from './input/micbutton';

const IMG_URL = 'https://img.wellaios.ai/';

const UserInputPane: React.FC<{
    addMessage: (msg: MsgType) => void;
    uid: string | null;
    setSubTextType: (subTextType: string) => void;
    setAttachmentSize: (attachmentSize: Number) => void;
    attachmentSize: Number;
}> = function ({
    addMessage,
    uid,
    setSubTextType,
    setAttachmentSize,
    attachmentSize,
}) {
    const [msg, setMsg] = useState('');
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const [attachFile, setAttachFile] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);

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
                            {setSubTextType('limit')}
                            <AttachButton
                                setAttachFile={setAttachFile}
                                setPreviewUrls={setPreviewUrls}
                                setSelectedFiles={setSelectedFiles}
                                setSubTextType={setSubTextType}
                                setAttachmentSize={setAttachmentSize}
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
                                setShowToast={setShowToast}
                            />
                            <MicrophoneButton
                                setMsg={setMsg}
                                setSubTextType={setSubTextType}
                            />
                        </>
                    )}
                </div>
                {previewUrls.length > 0 && (
                    <PreviewList
                        previewUrls={previewUrls}
                        setPreviewUrls={setPreviewUrls}
                        setSelectedFiles={setSelectedFiles}
                        selectedFiles={selectedFiles}
                        setAttachmentSize={setAttachmentSize}
                        attachmentSize={attachmentSize}
                    />
                )}
                {showToast && (
                    <PointsToast
                        points={10}
                        onClose={() => setShowToast(false)}
                    />
                )}
            </div>
        </div>
    );
};

const SendButton: React.FC<{
    sendButtonClicked: () => void;
    loading: boolean;
    msg: string;
    selectedFiles: File[];
    setShowToast: (showToast: boolean) => void;
}> = ({sendButtonClicked, loading, msg, selectedFiles, setShowToast}) => {
    return (
        <div
            className={`flex justify-center items-center cursor-pointer border-[#67677466] border-[1px] rounded-[12px] ${msg.trim() === '' && selectedFiles.length === 0 ? '' : 'bg-[#012F44]'}`}
            onClick={() => {
                sendButtonClicked();
                setShowToast(true);
            }}
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
