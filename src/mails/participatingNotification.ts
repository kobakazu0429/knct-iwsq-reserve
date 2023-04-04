// イベントへ参加申し込みをし、キャンセル待ちをするときのメール

import { z } from "zod";
import { dedent } from "ts-dedent";
import { FOOTER_MESSAGE } from "./constants";
import { stringOrDateWithTransform } from "../libs/zod/stringOrDateWithTransform";

export const participatingNotificationMailInputSchema = z.object({
  name: z.string(),
  event_name: z.string(),
  description: z
    .string()
    .optional()
    .transform((v) => v ?? ""),
  place: z.string(),
  start_time: stringOrDateWithTransform,
  end_time: stringOrDateWithTransform,
  cancel_url: z.string(),
});

export const participatingNotificationMailSubject =
  "参加申し込みが完了しました！";

export const participatingNotificationMailBody = dedent`
{{name}} さん

インキュベーションスクエアです。
申し込みが完了したイベントについてお知らせします。
なお、参加予定人数が制限を上回っているため、現在は参加が確定していません。
参加可能になったら別途メールをお送りするので、指示に従って参加を確定させてください。

■イベント名
{{event_name}}

■説明
{{description}}

■場所
{{place}}

■時間
{{start_time}} 〜 {{end_time}}

■キャンセルについて
次のURLから申し込みのキャンセルができます。
{{cancel_url}}

${FOOTER_MESSAGE}
`;
