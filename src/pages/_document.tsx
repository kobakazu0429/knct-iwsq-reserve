import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
} from "next/document";
import { Provider as StyletronProvider } from "styletron-react";
import { Server } from "styletron-engine-atomic";
import { type sheetT } from "styletron-engine-atomic/src/server/server";
import { styletron } from "../styletron";

class MyDocument extends Document<{ stylesheets: sheetT[] }> {
  static async getInitialProps(context: DocumentContext) {
    const renderPage = () =>
      context.renderPage({
        enhanceApp: (App) => (props) =>
          (
            <StyletronProvider value={styletron}>
              <App {...props} />
            </StyletronProvider>
          ),
      });

    const initialProps = await Document.getInitialProps({
      ...context,
      renderPage,
    });
    const stylesheets = (styletron as Server).getStylesheets() || [];
    return { ...initialProps, stylesheets };
  }

  render() {
    return (
      <Html lang="ja">
        <Head>
          <style>{`
            body {
              margin: 0px;
              padding: 0px;
            }
          `}</style>
          {this.props.stylesheets.map((sheet, i) => (
            <style
              className="_styletron_hydrate_"
              dangerouslySetInnerHTML={{ __html: sheet.css }}
              media={sheet.attrs.media}
              data-hydrate={sheet.attrs["data-hydrate"]}
              key={i}
            />
          ))}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
