import type {AppProps} from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import '../styles/globals.css';

function App({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>WellAIOS Web Agent</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
