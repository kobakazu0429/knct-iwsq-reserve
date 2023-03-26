import { z } from "zod";

export const cancelableParticipantOrApplicantInputSchema = z.object({
  type: z.enum(["applied", "participating"]),
  cancelToken: z.string(),
});
