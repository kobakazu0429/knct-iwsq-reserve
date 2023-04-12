import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignatureWithSigningKey } from "../../../libs/qstash/verify";
import {
  applicantsToParticipants,
  applicantsToParticipantsInput,
  createAppliedCancelUrl,
  createConfirmParticipatingUrl,
  updateParticipantableNotifiedAt,
} from "../../../service/EventUser";
import { sendgrid } from "../../../service/SendGrid";
import { getBaseUrl } from "../../../utils/url";
import {
  applicantsToParticipantsMailInputSchema,
  applicantsToParticipantsMailBody,
  applicantsToParticipantsMailSubject,
} from "./../../../mails/applicantsToParticipants";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const input =
      req.body === ""
        ? undefined
        : applicantsToParticipantsInput.parse(req.body);
    const data = await applicantsToParticipants(input);
    const result = data.result;

    if (!result) {
      return res.status(200).end();
    }

    const personalizations = result.map((e) => {
      const substitutions = applicantsToParticipantsMailInputSchema.parse({
        name: e.name,
        event_name: e.Applicant?.Event.name,
        description: e.Applicant?.Event.description,
        place: e.Applicant?.Event.place,
        start_time: e.Applicant?.Event.start_time,
        end_time: e.Applicant?.Event.end_time,
        cancel_url: createAppliedCancelUrl(
          getBaseUrl(),
          e.Applicant!.cancel_token!
        ),
        participant_url: createConfirmParticipatingUrl(
          getBaseUrl(),
          e.Applicant!.id
        ),
        deadline: e.Applicant?.deadline,
      });
      return { to: e.email, substitutions };
    });

    await sendgrid.personalizations({
      subject: applicantsToParticipantsMailSubject,
      text: applicantsToParticipantsMailBody,
      personalizations,
    });

    const applicantIds = result.map((v) => v.Applicant!.id) as [
      string,
      ...string[]
    ];
    await updateParticipantableNotifiedAt({ applicantIds });

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
