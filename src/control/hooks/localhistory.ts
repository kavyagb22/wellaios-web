import {MsgType} from '@/interface/msg';
import {useState, useEffect} from 'react';

const DB_NAME = 'chatHistoryDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

/**
 * Custom hook for managing chat history using IndexedDB.
 * @returns An object containing the chat history and a function to add a new message.
 */
export const useHistory = (uid: string | null) => {
    const [db, setDb] = useState<IDBDatabase | null>(null);
    const [history, setHistory] = useState<MsgType[] | undefined>(undefined);

    /**
     * Initializes the IndexedDB database.
     */
    const initDatabase = async function () {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = event => {
            console.error(
                'Database error:',
                (event.target as IDBRequest).error
            );
        };

        request.onsuccess = event => {
            setDb((event.target as IDBOpenDBRequest).result);
        };

        request.onupgradeneeded = event => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {keyPath: 'timestamp'}); // Use timestamp as the key
            }
        };
    };

    /**
     * Retrieves the chat history from IndexedDB, optionally limiting the number of messages.
     * @param limit The maximum number of messages to retrieve. If not provided, retrieves all messages.
     * @returns A Promise that resolves with an array of chat messages.
     */
    const fetchHistory = async function (): Promise<void> {
        if (!db) {
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();

        const history: MsgType[] = [];
        request.onsuccess = event => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                history.push(cursor.value);
                cursor.continue(); // Keep iterating if limit not reached
            } else {
                setHistory(history); // Resolve with all messages when cursor is done
            }
        };
        request.onerror = event => {
            console.error(
                'Error getting history:',
                (event.target as IDBRequest).error
            );
        };
    };

    const fetchFromDB = async function (): Promise<void> {};

    /**
     * Adds a message to the chat history in IndexedDB.
     * @param message The chat message to add.
     * @returns A Promise that resolves when the message is added.
     */
    const addMessage = async function (message: MsgType) {
        if (uid === null) {
            if (!db) {
                return;
            }
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.add(message);
            setHistory(h => {
                if (h === undefined) {
                    return undefined;
                }
                return [...h, message];
            });
        }
    };

    useEffect(() => {
        if (uid === null) {
            initDatabase();
        } else {
            fetchFromDB();
        }
    }, []);

    useEffect(() => {
        if (db !== null) {
            fetchHistory();
        }
    }, [db]);

    /**
     * Clears the chat history in IndexedDB.
     * @returns A Promise that resolves when the history is cleared.
     */
    const clearHistory = async function (): Promise<void> {
        if (!db) {
            return;
        }
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            setHistory([]);
        };
        request.onerror = event => {
            console.error(
                'Error clearing history:',
                (event.target as IDBRequest).error
            );
        };
    };

    return {history, addMessage, clearHistory};
};
