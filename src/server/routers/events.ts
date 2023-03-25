import { router, procedure, authProcedure } from "../trpc";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma";

export const eventsRouter = router({
  get: procedure
    .input(
      z
        .object({
          id: z.string().optional(),
          hidden: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          place: true,
          start_time: true,
          end_time: true,
          attendance_limit: true,
          status: true,
          _count: {
            select: {
              Applicant: true,
              Participant: true,
            },
          },
        },
        where: {
          NOT: {
            published_at: null,
          },
          id: input?.id,
          hidden: false,
          end_time: {
            gt: new Date(),
          },
        },
      });

      return events;
    }),
  getWithAuth: authProcedure
    .input(
      z
        .object({
          id: z.string().optional(),
          hidden: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const events = await prisma.event.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          place: true,
          start_time: true,
          end_time: true,
          attendance_limit: true,
          organizer: {
            select: {
              name: true,
            },
          },
          status: true,
          _count: {
            select: {
              Applicant: true,
              Participant: true,
            },
          },
        },
        where: {
          id: input?.id,
          hidden: input?.hidden,
          organizerId: ctx.session.user.roleHelper.isGuest
            ? ctx.session.user.id
            : undefined,
        },
      });

      return events;
    }),
  detailById: authProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return prisma.event.findFirst({
        select: {
          id: true,
          name: true,
          description: true,
          place: true,
          start_time: true,
          end_time: true,
          attendance_limit: true,
          published_at: true,
          hidden: true,
          organizer: {
            select: {
              name: true,
            },
          },
          status: true,
          Applicant: {
            select: {
              EventUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  affiliation: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              deadline: true,
              canceled_at: true,
              cancel_token: true,
            },
          },
          Participant: {
            select: {
              EventUser: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  affiliation: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              canceled_at: true,
              cancel_token: true,
            },
          },
        },
        where: {
          id: input.id,
          organizerId: ctx.session.user.roleHelper.isGuest
            ? ctx.session.user.id
            : undefined,
        },
      });
    }),
  create: authProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        place: z.string(),
        hidden: z.boolean().optional(),
        start_time: z.union([z.string().datetime(), z.date()]),
        end_time: z.union([z.string().datetime(), z.date()]),
        published_at: z.union([z.string().datetime(), z.date()]).optional(),
        attendance_limit: z.number().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const eventData: Prisma.EventCreateInput = {
        ...input,
        organizer: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        hidden: ctx.session.user.roleHelper.isGuest
          ? true
          : input.hidden ?? true,
        published_at: ctx.session.user.roleHelper.isGuest
          ? null
          : input.published_at ?? null,
      };

      return await prisma.$transaction(async (tx) => {
        const event = await tx.event.create({
          data: eventData,
        });

        if (ctx.session.user.roleHelper.isGuest) {
          await tx.approvalRequest.create({
            data: {
              event: {
                connect: { id: event.id },
              },
              status: "PENDING",
            },
          });
        }

        return event;
      });
    }),
});
