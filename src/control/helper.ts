export function getCurrentTS() {
    return Math.floor(Date.now() / 1000);
}

const BASE_DIGITS =
    'QWERTYUIOPASDFGHJKLZXCVBNM0123456789abcdefghijklmnopqrstuvwxyz';

const M = BigInt('329786645102817707716249425641');
const B = BigInt('151976132126508806593515959148');
const K = BigInt('216913970071842225868565326464');

export const apiSign = function (v: number) {
    const x = BigInt(v);
    const out = ((x + K) * B) % M;
    let temp = out;
    const base = BigInt(BASE_DIGITS.length);
    let result = '';
    while (temp > 0) {
        const remainder = temp % base;
        result = BASE_DIGITS[Number(remainder)] + result;
        temp = temp / base;
    }
    return result;
};
