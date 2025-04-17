import type {AppProps} from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import '../styles/globals.css';

function App({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>WellAIOS Web Agent</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
