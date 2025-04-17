const IMG_BASE_URL = 'https://img.wellaios.ai';

export const getMedia = function (img: string): string {
    if (img.startsWith('data:image')) {
        return img;
    }
    return `${IMG_BASE_URL}/${img}`;
};

export const getMediaWithDefault = function (
    img: string | undefined | null,
    defImg: string
) {
    if (!img || img === '') {
        return defImg;
    }
    return getMedia(img);
};
