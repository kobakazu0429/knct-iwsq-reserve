import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignatureWithSigningKey } from "../../../libs/qstash/verify";
import {
  cancelOverDeadline,
  cancelOverDeadlineInput,
  updateOverDeadlineNotifiedAt,
} from "../../../service/EventUser";
import { sendgrid } from "../../../service/SendGrid";
import {
  cancelOverDeadlineMailInputSchema,
  cancelOverDeadlineMailBody,
  cancelOverDeadlineMailSubject,
} from "./../../../mails/cancelOverDeadline";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const input =
      req.body === "" ? undefined : cancelOverDeadlineInput.parse(req.body);
    const data = await cancelOverDeadline(input);
    const result = data.result;

    if (!result) {
      return res.status(200).end();
    }

    const personalizations = result.map((e) => {
      const substitutions = cancelOverDeadlineMailInputSchema.parse({
        name: e.EventUser.name,
        event_name: e.Event.name,
        description: e.Event.description,
        place: e.Event.place,
        start_time: e.Event.start_time,
        end_time: e.Event.end_time,
        deadline: e.deadline,
        canceled_at: e.canceled_at,
      });
      return { to: e.EventUser.email, substitutions };
    });

    await sendgrid.personalizations({
      subject: cancelOverDeadlineMailSubject,
      text: cancelOverDeadlineMailBody,
      personalizations,
    });

    const applicantIds = result.map((v) => v.id) as [string, ...string[]];
    await updateOverDeadlineNotifiedAt({ applicantIds });

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
};

export default verifySignatureWithSigningKey(handler, {
  noVerify: process.env.NODE_ENV === "development",
});

export const config = {
  api: {
    bodyParser: false,
  },
};
