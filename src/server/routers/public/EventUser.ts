import { match } from "ts-pattern";
import { publicProcedure } from "../../trpc";
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
  applicantsToParticipants,
  applicantsToParticipantsInput,
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
export const eventUsersRouter = {
  cancelableApplicant: publicProcedure
    .input(cancelableApplicantInput)
    .query(async ({ input }) => {
      return cancelableApplicant(input);
    }),

  cancelableParticipant: publicProcedure
    .input(cancelableParticipantInput)
    .query(async ({ input }) => {
      return cancelableParticipant(input);
    }),

  cancelApplicant: publicProcedure
    .input(cancelableApplicantInput)
    .mutation(async ({ input }) => {
      return cancelApplicant(input);
    }),

  cancelParticipant: publicProcedure
    .input(cancelableParticipantInput)
    .mutation(async ({ input }) => {
      return cancelParticipant(input);
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

  applicantsToParticipants: publicProcedure
    .input(applicantsToParticipantsInput)
    .mutation(async ({ input }) => {
      return applicantsToParticipants(input);
    }),
};
