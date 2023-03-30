import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { setErrorMap } from "zod";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider } from "baseui";
import { SnackbarProvider, DURATION } from "baseui/snackbar";
import { styletron } from "../styletron";
import { zodCustomErrorMap } from "../libs/zod/zodCustomErrorMap";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  setErrorMap(zodCustomErrorMap("ja"));

  return (
    <SessionProvider session={session}>
      <StyletronProvider value={styletron}>
        <BaseProvider theme={LightTheme}>
          <SnackbarProvider defaultDuration={DURATION.medium}>
            <Component {...pageProps} />
          </SnackbarProvider>
        </BaseProvider>
      </StyletronProvider>
    </SessionProvider>
  );
}
