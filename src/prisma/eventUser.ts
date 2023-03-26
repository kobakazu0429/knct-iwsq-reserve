import { z } from "zod";

export const cancelApplicantInputSchema = z.object({
  cancelToken: z.string(),
});

export const cancelParticipantInputSchema = z.object({
  cancelToken: z.string(),
});
