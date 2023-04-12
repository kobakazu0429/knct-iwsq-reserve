import { z } from "zod";
import { match } from "ts-pattern";
import { publicProcedure, router } from "../../trpc";
import { getBaseUrl } from "./../../../utils/url";
import { sendgrid } from "../../../service/SendGrid";
import {
  cancelableApplicant,
  cancelableApplicantInput,
  cancelableParticipant,
  cancelableParticipantInput,
  cancelApplicant,
  cancelParticipant,
  createParticipantOrApplicant,
  createParticipantOrApplicantInput,
  confirmableParticipanting,
  confirmableParticipantingInput,
  confirmParticipantingInput,
  confirmParticipanting,
  createAppliedCancelUrl,
  createParticipatingCancelUrl,
} from "../../../service/EventUser";
import {
  appliedNotificationMailBody,
  appliedNotificationMailSubject,
  appliedNotificationMailInputSchema,
} from "../../../mails/appliedNotification";
import {
  participatingNotificationMailBody,
  participatingNotificationMailSubject,
  participatingNotificationMailInputSchema,
} from "../../../mails/participatingNotification";

/**
 * @package
 */
export const eventUsersRouter = router({
  cancelableApplicant: publicProcedure
    .input(cancelableApplicantInput)
    .output(
      z.object({
        id: z.string(),
        event: z.object({
          id: z.string(),
          name: z.string(),
        }),
        applicant: z.object({
          deadline: z.date().nullish(),
          canceled_at: z.date().nullish(),
        }),
      })
    )
    .query(async ({ input }) => {
      const result = await cancelableApplicant(input);
      // TODO Mail
      return {
        id: result.id,
        event: {
          id: result.Applicant!.Event.id,
          name: result.Applicant!.Event.name,
        },
        applicant: {
          deadline: result.Applicant!.deadline,
          canceled_at: result.Applicant!.canceled_at,
        },
      };
    }),

  cancelableParticipant: publicProcedure
    .input(cancelableParticipantInput)
    .output(
      z.object({
        id: z.string(),
        event: z.object({
          id: z.string(),
          name: z.string(),
        }),
        participant: z.object({
          canceled_at: z.date().nullish(),
        }),
      })
    )
    .query(async ({ input }) => {
      const result = await cancelableParticipant(input);
      // TODO Mail
      return {
        id: result.id,
        event: {
          id: result.Participant!.Event.id,
          name: result.Participant!.Event.name,
        },
        participant: {
          canceled_at: result.Participant!.canceled_at,
        },
      };
    }),

  cancelApplicant: publicProcedure
    .input(cancelableApplicantInput)
    .output(z.object({ event: z.object({ name: z.string() }) }))
    .mutation(async ({ input }) => {
      const result = await cancelApplicant(input);
      // TODO Mail
      return { event: { name: result.Event.name } };
    }),

  cancelParticipant: publicProcedure
    .input(cancelableParticipantInput)
    .output(z.object({ event: z.object({ name: z.string() }) }))
    .mutation(async ({ input }) => {
      const result = await cancelParticipant(input);
      // TODO Mail
      return { event: { name: result.Event.name } };
    }),

  createParticipantOrApplicant: publicProcedure
    .input(createParticipantOrApplicantInput)
    .mutation(async ({ input }) => {
      const result = await createParticipantOrApplicant(input);
      await match(result)
        .with({ type: "applied" }, () => {
          return sendgrid.personalizations({
            subject: appliedNotificationMailSubject,
            text: appliedNotificationMailBody,
            personalizations: [
              {
                to: result.user.email,
                substitutions: appliedNotificationMailInputSchema.parse({
                  name: result.user.name,
                  event_name: result.event.event_name,
                  description: result.event.description,
                  place: result.event.place,
                  start_time: result.event.start_time,
                  end_time: result.event.end_time,
                  cancel_url: createAppliedCancelUrl(
                    getBaseUrl(),
                    result.cancelToken
                  ),
                }),
              },
            ],
          });
        })
        .with({ type: "participating" }, () => {
          return sendgrid.personalizations({
            subject: participatingNotificationMailSubject,
            text: participatingNotificationMailBody,
            personalizations: [
              {
                to: result.user.email,
                substitutions: participatingNotificationMailInputSchema.parse({
                  name: result.user.name,
                  event_name: result.event.event_name,
                  description: result.event.description,
                  place: result.event.place,
                  start_time: result.event.start_time,
                  end_time: result.event.end_time,
                  cancel_url: createParticipatingCancelUrl(
                    getBaseUrl(),
                    result.cancelToken
                  ),
                }),
              },
            ],
          });
        })
        .exhaustive();
    }),

  confirmableParticipanting: publicProcedure
    .input(confirmableParticipantingInput)
    .output(
      z.object({
        event: z.object({
          id: z.string(),
          name: z.string(),
        }),
        applicant: z.object({
          deadline: z.date().nullish(),
          canceled_at: z.date().nullish(),
        }),
        participant: z.object({
          canceled_at: z.date().nullish(),
          created_at: z.date().nullish(),
        }),
      })
    )
    .query(async ({ input }) => {
      const result = await confirmableParticipanting(input);
      return {
        event: {
          id: result.Event.id,
          name: result.Event.name,
        },
        applicant: {
          deadline: result.deadline,
          canceled_at: result.canceled_at,
        },
        participant: {
          canceled_at: result.EventUser.Participant?.canceled_at,
          created_at: result.EventUser.Participant?.createdAt,
        },
      };
    }),

  confirmParticipanting: publicProcedure
    .input(confirmParticipantingInput)
    .output(
      z.object({
        event: z.object({
          id: z.string(),
          name: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const result = await confirmParticipanting(input);
      return {
        event: {
          id: result.Event.id,
          name: result.Event.name,
        },
      };
    }),
});
