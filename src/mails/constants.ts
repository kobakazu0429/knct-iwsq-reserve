import { dedent } from "ts-dedent";

/**
 * @package
 */
export const FOOTER_MESSAGE = dedent`
-------------------------------------------------
本メールに関する質問などは返信または、次のメールアドレスにお願いします。
${process.env.SENDGRID_FROM_EMAIL}
`;
