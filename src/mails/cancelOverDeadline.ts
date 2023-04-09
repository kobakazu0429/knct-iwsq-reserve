// キャンセル待ち後、参加申し込み期限を過ぎたユーザーへ通知するメール

import { z } from "zod";
import { dedent } from "ts-dedent";
import { FOOTER_MESSAGE } from "./constants";
import { stringOrDateWithTransform } from "../libs/zod/stringOrDateWithTransform";

export const cancelOverDeadlineMailInputSchema = z.object({
  name: z.string(),
  event_name: z.string(),
  description: z.string(),
  place: z.string(),
  start_time: stringOrDateWithTransform,
  end_time: stringOrDateWithTransform,
  deadline: stringOrDateWithTransform,
  canceled_at: stringOrDateWithTransform,
});

export const cancelOverDeadlineMailSubject =
  "参加申し込み期限を過ぎたイベントがあります";

export const cancelOverDeadlineMailBody = dedent`
{{name}} さん

インキュベーションスクエアです。
参加申し込み期限を過ぎてしまったためキャンセルとなりましたイベントについてお知らせします。

■イベント名
{{event_name}}

■説明
{{description}}

■場所
{{place}}

■時間
{{start_time}} 〜 {{end_time}}

■申し込み期限
{{deadline}}

■キャンセル日時
{{canceled_at}}

${FOOTER_MESSAGE}
`;
