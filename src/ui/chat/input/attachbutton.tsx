import Image from 'next/image';
import {useState, useRef} from 'react';
import {ATTACHMENT_LIMIT} from '@/config/constants';

const AttachButton: React.FC<{
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setAttachFile: (attachFile: boolean) => void;
    setSubTextType: (subTextType: string) => void;
    setAttachmentSize: (attachmentSize: Number) => void;
}> = ({
    setPreviewUrls,
    setSelectedFiles,
    setAttachFile,
    setSubTextType,
    setAttachmentSize,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [acceptType, setAcceptType] = useState<string>('');

    const handleFileTypeClick = (type: (typeof fileTypes)[0]) => {
        setAcceptType(type.accept);
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubTextType('limit');
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);

        // const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        // setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
        setSelectedFiles(prevSelected => {
            const allowed = ATTACHMENT_LIMIT - prevSelected.length;
            const fileLimit = files.slice(0, allowed);
            const updatedFiles = [...prevSelected, ...fileLimit];
            setPreviewUrls(prevUrls => [
                ...prevUrls,
                ...fileLimit.map(file => URL.createObjectURL(file)),
            ]);
            setAttachmentSize(updatedFiles.length);
            return updatedFiles;
        });
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
                        onClick={() => {
                            setAttachFile(false);
                            setSubTextType('general');
                        }}
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
                    className={`flex-1 py-[6px] px-[12px] flex flex-row gap-[4px] items-center justify-center border-[1px] border-[#67677466] rounded-[12px] ${
                        type.name === 'Youtube' ||
                        type.name === 'Website' ||
                        type.name === 'TXT' ||
                        type.name === 'MP3' ||
                        type.name === 'PDF'
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                    }`}
                    key={index}
                    onClick={() => handleFileTypeClick(type)}
                    disabled={
                        type.name === 'Youtube' ||
                        type.name === 'Website' ||
                        type.name === 'TXT' ||
                        type.name === 'MP3' ||
                        type.name === 'PDF'
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

export default AttachButton;
