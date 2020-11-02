import { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/core";

import "@css/global.css";
import MainLayout from "@layouts/MainLayout";

let theme = extendTheme({
  fonts: {
    body: "Quicksand, sans-serif",
    heading: "Quicksand, sans-serif",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </ChakraProvider>
  );
}
