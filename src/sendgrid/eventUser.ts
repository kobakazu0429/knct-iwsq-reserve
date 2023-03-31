import { FOOTER_MESSAGE, send, type Data } from "./index";
import { dedent } from "ts-dedent";

interface Message {
  name: string;
  email: Data["to"];
  cancelUrl: string;
  event: {
    name: string;
    description: string;
    place: string;
    start_time: string;
    end_time: string;
  };
}

export const appliedNotificationEmail = async ({
  name,
  email,
  cancelUrl,
  event: { name: eventName, description, place, start_time, end_time },
}: Message) => {
  const text = dedent`
    ${name} さん

    インキュベーションスクエアです。
    申し込みが完了したイベントについてお知らせします。

    ■イベント名
    ${eventName}

    ■説明
    ${description}

    ■場所
    ${place}

    ■時間
    ${start_time} 〜 ${end_time}

    ■キャンセルについて
    次のURLから申し込みのキャンセルができます。
    ${cancelUrl}

    ${FOOTER_MESSAGE}
    `;

  send({ to: email, subject: "参加申し込みが完了しました！", text });
};

export const participatingNotificationEmail = async ({
  name,
  email,
  cancelUrl,
  event: { name: eventName, description, place, start_time, end_time },
}: Message) => {
  const text = dedent`
    ${name} さん

    インキュベーションスクエアです。
    申し込みが完了したイベントについてお知らせします。
    なお、参加予定人数が制限を上回っているため、現在は参加が確定していません。
    参加可能になったら別途メールをお送りするので、指示に従って参加を確定させてください。

    ■イベント名
    ${eventName}

    ■説明
    ${description}

    ■場所
    ${place}

    ■時間
    ${start_time} 〜 ${end_time}

    ■キャンセルについて
    次のURLから参加のキャンセルができます。
    ${cancelUrl}

    ${FOOTER_MESSAGE}
    `;

  send({ to: email, subject: "参加申し込みが完了しました！", text });
};
