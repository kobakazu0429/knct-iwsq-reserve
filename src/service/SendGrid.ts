import { default as __sendgrid } from "@kobakazu0429/sendgrid-mail";
import { Client } from "@kobakazu0429/sendgrid-client";

interface Personalization {
  to: string;
  substitutions: Record<string, string>;
}

class SendGrid {
  constructor() {
    if (process.env.NODE_ENV === "development") {
      const client = new Client();
      __sendgrid.setClient(client);
      __sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
      client.setDefaultRequest("baseUrl", process.env.SENDGRID_BASE_URL);
    } else if (process.env.NODE_ENV === "production") {
      __sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);
    }
  }

  public async send(data: {
    to: string;
    subject: string;
    text: string;
    sendAtUnixTime?: number;
  }) {
    return __sendgrid.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      to: data.to,
      subject: data.subject,
      text: data.text,
      sendAt: data.sendAtUnixTime,
    });
  }

  public async personalizations(data: {
    subject: string;
    text: string;
    personalizations: Personalization[];
    sendAtUnixTime?: number;
  }) {
    return __sendgrid.send({
      from: process.env.SENDGRID_FROM_EMAIL!,
      text: data.text,
      subject: data.subject,
      personalizations: data.personalizations.map(({ to, substitutions }) => ({
        to,
        substitutions,
      })),
      sendAt: data.sendAtUnixTime,
    });
  }
}

const _sendgrid = new SendGrid();
const sendgrid = globalThis.sendgrid || _sendgrid;
if (process.env.NODE_ENV !== "production") globalThis.sendgrid = sendgrid;

declare global {
  // eslint-disable-next-line no-var
  var sendgrid: typeof _sendgrid | undefined;
}

export { sendgrid };
