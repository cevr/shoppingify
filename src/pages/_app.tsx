import { AppProps } from "next/app";
import Head from "next/head";
import { ReactQueryCacheProvider } from "react-query";
import { Hydrate } from "react-query/hydration";

import "@css/global.css";
import "@css/tailwind.css";
import { MainLayout } from "@layouts/MainLayout";
import { queryCache } from "@lib/cache";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  let router = useRouter();
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1"
        />
      </Head>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <Hydrate state={pageProps.dehydratedState}>
          {router.pathname !== "/signin" ? (
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          ) : (
            <Component {...pageProps} />
          )}
        </Hydrate>
      </ReactQueryCacheProvider>
    </>
  );
}
