import Image from 'next/image';

const PreviewList: React.FC<{
    previewUrls: string[];
    selectedFiles: File[];
    setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setAttachmentSize: (attachmentSize: Number) => void;
    attachmentSize: Number;
}> = ({
    previewUrls,
    setPreviewUrls,
    setSelectedFiles,
    selectedFiles,
    setAttachmentSize,
    attachmentSize,
}) => {
    const handleRemovePreview = (indexToRemove: number) => {
        setAttachmentSize(Number(attachmentSize) - 1);
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

export default PreviewList;
