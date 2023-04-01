import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignatureWithSigningKey } from "../../../libs/qstash/verify";
import { trpcServerSide } from "../../../server/trpc";

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const trpc = trpcServerSide();
  const result = await trpc.eventUsers.applicantsToParticipants({
    eventIds: ["clf4xvz43000c9kv1jcx7pd0i"],
  });
  res.status(200).json(result);
};

export default verifySignatureWithSigningKey(handler, {
  noVerify: process.env.NODE_ENV === "development",
});

export const config = {
  api: {
    bodyParser: false,
  },
};
