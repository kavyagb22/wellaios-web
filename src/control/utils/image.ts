const IMG_BASE_URL = 'https://d2huzqodohfy8t.cloudfront.net';

export const getImage = function (img: string, def_img: string): string {
    if (!img || img === '') {
        return def_img;
    }
    if (img.startsWith('data:image')) {
        return img;
    }
    return `${IMG_BASE_URL}/${img}`;
};
