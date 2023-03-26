import { participatingNotificationEmail } from "./../../sendgrid/eventUser";
import { router, procedure } from "../trpc";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "../../prisma";
import { appliedNotificationEmail } from "../../sendgrid/eventUser";
import { formatISO9075 } from "date-fns";
import { cancelableParticipantOrApplicantInputSchema } from "../../prisma/eventUser";

export const eventUsersRouter = router({
  cancelableParticipantOrApplicant: procedure
    .input(cancelableParticipantOrApplicantInputSchema)
    .query(async ({ input }) => {
      if (input.type === "applied") {
        const result = await prisma.eventUser.findFirst({
          select: {
            id: true,
            Applicant: {
              select: { Event: { select: { name: true, id: true } } },
            },
          },
          where: {
            Applicant: {
              cancel_token: input.cancelToken,
            },
          },
        });
        return { type: input.type, ...result };
      } else {
        const result = await prisma.eventUser.findFirst({
          select: {
            id: true,
            Participant: {
              select: { Event: { select: { name: true, id: true } } },
            },
          },
          where: {
            Participant: {
              cancel_token: input.cancelToken,
            },
          },
        });
        return { type: input.type, ...result };
      }
    }),
  createParticipantOrApplicant: procedure
    .input(
      z.object({
        eventId: z.string(),
        name: z.string(),
        email: z.string().email(),
        department: z.enum([
          "M",
          "E",
          "C",
          "A",
          "S",
          "GRADUATE",
          "PARENT",
          "TEACHER",
          "OTHER",
        ]),
        grade: z.enum([
          "FIRST",
          "SECOND",
          "THIRD",
          "FOURTH",
          "FIFTH",
          "JUNIOR",
          "SENIOR",
          "GRADUATE",
          "PARENT",
          "TEACHER",
          "OTHER",
        ]),
      })
    )
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
            cancelUrl: `https://exmaple.com/${cancel_token}`,
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
            cancelUrl: `https://exmaple.com/${cancel_token}`,
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
});
