import { router, procedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { formatISO9075 } from "date-fns";
import { prisma } from "../../prisma";
import {
  appliedNotificationEmail,
  participatingNotificationEmail,
} from "../../sendgrid/eventUser";
import {
  cancelApplicantInputSchema,
  cancelParticipantInputSchema,
} from "../../prisma/eventUser";
import { getBaseUrl } from "../../utils/url";
import { createParticipantOrApplicantSchema } from "../../models/EventUser";
import {
  applicantsToParticipants,
  applicantsToParticipantsInput,
} from "../../service/EventUser";

export const eventUsersRouter = router({
  cancelableApplicant: procedure
    .input(cancelApplicantInputSchema)
    .query(async ({ input }) => {
      const result = await prisma.eventUser.findFirstOrThrow({
        select: {
          id: true,
          Applicant: {
            select: {
              canceled_at: true,
              Event: { select: { name: true, id: true } },
            },
          },
        },
        where: {
          Applicant: {
            cancel_token: input.cancelToken,
          },
        },
      });
      return result;
    }),
  cancelableParticipant: procedure
    .input(cancelParticipantInputSchema)
    .query(async ({ input }) => {
      const result = await prisma.eventUser.findFirstOrThrow({
        select: {
          id: true,
          Participant: {
            select: {
              canceled_at: true,
              Event: { select: { name: true, id: true } },
            },
          },
        },
        where: {
          Participant: {
            cancel_token: input.cancelToken,
          },
        },
      });
      return result;
    }),
  cancelApplicant: procedure
    .input(cancelApplicantInputSchema)
    .mutation(async ({ input }) => {
      const result = await prisma.$transaction(async (tx) => {
        const eventUser = await tx.eventUser.findFirstOrThrow({
          select: {
            Applicant: {
              select: {
                id: true,
              },
            },
          },
          where: {
            Applicant: {
              cancel_token: input.cancelToken,
            },
          },
        });

        const applicantId = eventUser?.Applicant?.id;

        if (!applicantId) throw new Error("applicantId is not found.");

        return await tx.applicant.update({
          select: {
            Event: { select: { name: true } },
          },
          where: {
            id: applicantId,
          },
          data: {
            canceled_at: new Date(),
          },
        });
      });

      return result;
    }),
  cancelParticipant: procedure
    .input(cancelParticipantInputSchema)
    .mutation(async ({ input }) => {
      const result = await prisma.$transaction(async (tx) => {
        const eventUser = await tx.eventUser.findFirstOrThrow({
          select: {
            Participant: { select: { id: true } },
          },
          where: {
            Participant: {
              cancel_token: input.cancelToken,
            },
          },
        });

        const participantId = eventUser?.Participant?.id;

        if (!participantId) throw new Error("participantId is not found.");

        return await tx.participant.update({
          select: {
            Event: { select: { name: true } },
          },
          where: {
            id: participantId,
          },
          data: {
            canceled_at: new Date(),
          },
        });
      });

      return result;
    }),
  createParticipantOrApplicant: procedure
    .input(createParticipantOrApplicantSchema)
    .mutation(async ({ input }) => {
      return await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            place: true,
            start_time: true,
            end_time: true,
            attendance_limit: true,
            _count: {
              select: {
                Applicant: {
                  where: {
                    canceled_at: null,
                    deadline: {
                      gt: new Date(),
                    },
                  },
                },
                Participant: {
                  where: {
                    canceled_at: null,
                  },
                },
              },
            },
          },
          where: {
            id: input.eventId,
          },
        });

        if (!event) throw new Error("");

        const canParticipate =
          event.attendance_limit - event._count.Participant > 0;

        const eventUserData: Omit<
          Prisma.EventUserCreateInput,
          | "id"
          | "mails"
          | "Participant"
          | "Applicant"
          | "createdAt"
          | "updatedAt"
        > = {
          name: input.name,
          email: input.email,
          department: input.department,
          grade: input.grade,
        };

        if (canParticipate) {
          const cancel_token = nanoid();
          const eventUser = await tx.eventUser.create({
            data: {
              ...eventUserData,
              Participant: {
                create: {
                  cancel_token,
                  eventId: event.id,
                },
              },
            },
          });

          await appliedNotificationEmail({
            email: eventUserData.email,
            name: eventUserData.name,
            cancelUrl: `${getBaseUrl()}/events/cancel/applied/${cancel_token}`,
            event: {
              name: event.name,
              description: event.description ?? "",
              place: event.place,
              start_time: formatISO9075(event.start_time),
              end_time: formatISO9075(event.end_time),
            },
          });

          return eventUser;
        } else {
          const cancel_token = nanoid();
          const eventUser = await tx.eventUser.create({
            data: {
              ...eventUserData,
              Applicant: {
                create: {
                  cancel_token,
                  eventId: event.id,
                },
              },
            },
          });

          await participatingNotificationEmail({
            email: eventUserData.email,
            name: eventUserData.name,
            cancelUrl: `${getBaseUrl()}/events/cancel/participating/${cancel_token}`,
            event: {
              name: event.name,
              description: event.description ?? "",
              place: event.place,
              start_time: formatISO9075(event.start_time),
              end_time: formatISO9075(event.end_time),
            },
          });

          return eventUser;
        }
      });
    }),
  applicantsToParticipants: procedure
    .input(applicantsToParticipantsInput)
    .mutation(async ({ input }) => {
      return applicantsToParticipants(input);
    }),
});
