import { router, procedure } from "../trpc";
import { z } from "zod";
import { match, P } from "ts-pattern";
import { prisma } from "../../prisma";
import { userRoleHelper } from "../../prisma/user";

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
    .query(async ({ ctx, input }) => {
      const user = ctx.session?.user;
      const userId = user?.id;
      const role = user?.role;
      const roleHelper = userRoleHelper(role);

      const events = await prisma.event.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          place: true,
          start_time: true,
          end_time: true,
          attendance_limit: true,
          ...(!roleHelper.isAnonymous && {
            organizer: {
              select: {
                name: true,
              },
            },
          }),
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
            published_at: roleHelper.isAnonymous ? null : undefined,
          },
          id: input?.id,
          hidden: roleHelper.isAnonymous ? false : input?.hidden,
          organizerId: roleHelper.isGuest ? userId : undefined,
          end_time: {
            gt: roleHelper.isAnonymous ? new Date() : undefined,
          },
        },
      });

      return events;
    }),
  create: procedure
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
      const userId = ctx.session?.user.id;
      if (!userId) return { status: false, message: "userId is undefined." };

      const role = ctx.session?.user?.role;

      const roleHelper = userRoleHelper(role);
      const result = await prisma.event.create({
        data: {
          ...input,
          organizerId: userId,
          hidden: roleHelper.isGuest ? true : input.hidden ?? true,
          published_at: roleHelper.isGuest ? null : input.published_at,
        },
      });

      return { status: true, message: "created", data: result };
    }),
});
