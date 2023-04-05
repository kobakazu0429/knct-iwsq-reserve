import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignatureWithSigningKey } from "../../../libs/qstash/verify";
import { sendgrid } from "../../../service/SendGrid";
import { trpcServerSide } from "../../../trpc";
import {
  applicantsToParticipantsMailInputSchema,
  applicantsToParticipantsMailBody,
  applicantsToParticipantsMailSubject,
} from "./../../../mails/applicantsToParticipants";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const trpc = trpcServerSide();
  const result = await trpc.public.eventUsers.applicantsToParticipants();
  res.status(200).json(result);
  try {
    const personalizations = result.result?.map((e) => {
      const substitutions = applicantsToParticipantsMailInputSchema.parse({
        name: e.name,
        event_name: e.Applicant?.Event.name,
        description: e.Applicant?.Event.description,
        place: e.Applicant?.Event.place,
        start_time: e.Applicant?.Event.start_time,
        end_time: e.Applicant?.Event.end_time,
        cancel_url: e.Applicant?.cancel_token,
        participant_url: "",
        deadline: e.Applicant?.deadline,
      });
      return { to: e.email, substitutions };
    });

    if (!personalizations) throw new Error("");

    sendgrid.personalizations({
      subject: applicantsToParticipantsMailSubject,
      text: applicantsToParticipantsMailBody,
      personalizations,
    });
  } catch (error) {
    console.log(error);
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
