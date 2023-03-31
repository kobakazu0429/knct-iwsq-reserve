import { Client } from "@sendgrid/client";
import sendgrid, { ResponseError } from "@sendgrid/mail";
import { dedent } from "ts-dedent";

export interface Data {
  to: string;
  subject: string;
  text: string;
}

export const send = async (data: Data) => {
  if (process.env.NODE_ENV === "development") {
    const client = new Client();
    sendgrid.setClient(client);
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    client.setDefaultRequest("baseUrl", process.env.SENDGRID_BASE_URL);
  } else if (process.env.NODE_ENV === "production") {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  try {
    await sendgrid.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      ...data,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof ResponseError) {
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
};

export const FOOTER_MESSAGE = dedent`
  -------------------------------------------------
  本メールに関する質問などは返信または、次のメールアドレスにお願いします。
  ${process.env.SENDGRID_FROM_EMAIL}
`;
