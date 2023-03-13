import { router, procedure } from "../trpc";
import { z } from "zod";
import { match, P } from "ts-pattern";
import { prisma } from "../../prisma";
import { userRoleHelper } from "../../prisma/user";

export const eventsRouter = router({
  events: procedure
    .input(
      z
        .object({
          id: z.string().optional(),
          hidden: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const role = ctx.session?.user?.role;
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
          ...(roleHelper.isNotAnonymous && {
            organizer: {
              select: {
                name: true,
              },
            },
          }),
        },
        where: {
          NOT: {
            published_at: null,
          },
          ...(roleHelper.isNotAnonymous && {
            hidden: input?.hidden,
          }),
          end_time: {
            // gt: new Date(),
          },
        },
      });

      console.log(events);

      return events;
    }),
});
