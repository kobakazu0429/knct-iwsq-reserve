// イベントへ参加申し込みをし、参加できるときのメール

import { z } from "zod";
import { dedent } from "ts-dedent";
import { FOOTER_MESSAGE } from "./constants";
import { stringOrDateWithTransform } from "../libs/zod/stringOrDateWithTransform";

export const appliedNotificationMailInputSchema = z.object({
  name: z.string(),
  event_name: z.string(),
  description: z.string(),
  place: z.string(),
  start_time: stringOrDateWithTransform,
  end_time: stringOrDateWithTransform,
  cancel_url: z.string(),
});

export const appliedNotificationMailSubject = "参加申し込みが完了しました！";

export const appliedNotificationMailBody = dedent`
{{name}} さん

インキュベーションスクエアです。
申し込みが完了したイベントについてお知らせします。

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
