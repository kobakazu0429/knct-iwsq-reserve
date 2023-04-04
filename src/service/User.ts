import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma";
import { roles } from "../prisma/user";

const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export const usersList = async () => {
  const users = await prisma.user.findMany({
    select: defaultUserSelect,
  });

  return users;
};

export const updateRolesInput = z.object({
  id: z.string().array(),
  role: z.enum(roles),
});

export const updateRoles = async (input: z.infer<typeof updateRolesInput>) => {
  const result = await prisma.user.updateMany({
    data: {
      role: input.role,
    },
    where: {
      id: {
        in: input.id,
      },
    },
  });

  return result;
};
