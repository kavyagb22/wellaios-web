import type {AppProps} from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';

function App({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>WellAIOS Agent World</title>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default dynamic(() => Promise.resolve(App), {
    ssr: false,
});
