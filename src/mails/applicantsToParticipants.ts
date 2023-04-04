// キャンセル待ちから参加が可能になり、参加するかどうか確認するメール

import { z } from "zod";
import { dedent } from "ts-dedent";
import { FOOTER_MESSAGE } from "./constants";
import { stringOrDateWithTransform } from "../libs/zod/stringOrDateWithTransform";

export const applicantsToParticipantsMailInputSchema = z.object({
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
  participant_url: z.string(),
  deadline: z.string(),
});

export const applicantsToParticipantsMailSubject =
  "イベントへ参加できるようになりました！";

export const applicantsToParticipantsMailBody = dedent`
{{name}} さん

インキュベーションスクエアです。
キャンセル待ちをされていたイベントに参加可能になりました。
現時点では参加確定はしていないので注意してください。
期限を過ぎると次の方へ権利が移ります。
また、参加が難しい場合はできる限り早くキャンセルしていただけると、多くの方が参加できます。

■イベント名
{{event_name}}

■説明
{{description}}

■場所
{{place}}

■時間
{{start_time}} 〜 {{end_time}}

■参加確定について
次のURLから参加を確定できます。
{{participant_url}}

期限
{{deadline}}

■キャンセルについて
次のURLから参加のキャンセルできます。
{{cancel_url}}

${FOOTER_MESSAGE}
`;
