import {RequestType, WebRequestType} from '@/interface/api';
import {apiSign, getCurrentTS} from './helper';

const API_AP = 'https://api.wellaios.ai/wellaios-backend';

const internalAPI = async function (query: RequestType, timeout = false) {
    const ts = getCurrentTS();
    const noise = Math.floor(Math.random() * 15 - 7);
    const signed = {...query, time: ts, token: apiSign(ts + noise)};
    const request = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(signed),
        signal: timeout ? AbortSignal.timeout(10000) : undefined,
    };

    return fetch(API_AP, request);
};

export const fetchAPI = async function (query: WebRequestType) {
    const request: RequestType = {
        type: 'web',
        query,
    };
    const result = await internalAPI(request);
    if (result.ok) {
        return result.json();
    }
    throw new Error(await result.text());
};
