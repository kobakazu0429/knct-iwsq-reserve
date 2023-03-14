import { router, procedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../prisma";
import { userRoleHelper, roles } from "../../prisma/user";

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export const usersRouter = router({
  get: procedure
    .input(
      z
        .object({
          id: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const role = ctx.session?.user?.role;
      const roleHelper = userRoleHelper(role);
      if (!roleHelper.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "only ADMIN role",
        });
      }

      const users = await prisma.user.findMany({
        select: defaultUserSelect,
      });

      return users;
    }),

  update: procedure
    .input(
      z
        .object({
          id: z.string(),
          role: z.enum(roles),
        })
        .array()
    )
    .mutation(async ({ ctx, input }) => {
      const role = ctx.session?.user?.role;
      const roleHelper = userRoleHelper(role);
      if (!roleHelper.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "only ADMIN role",
        });
      }

      const result = await prisma.$transaction(
        input.map((data) =>
          prisma.user.update({
            where: {
              id: data.id,
            },
            data: {
              role: data.role,
            },
            select: defaultUserSelect,
          })
        )
      );

      return { status: true, message: "updated", data: result };
    }),
});
