import { faker } from "@faker-js/faker";
import { type Prisma, Role } from "@prisma/client";
import { prisma } from "../prisma";

// TODO: fixed with seed
const randomRole = () => {
  const roles = Object.values(Role);
  return roles[Math.floor(Math.random() * roles.length)];
};

export const UserHelper = {
  async create(args?: Partial<Prisma.UserCreateInput>) {
    return await prisma.user.create({
      data: {
        name: faker.name.fullName(),
        role: randomRole(),
        accounts: {
          create: {
            type: "oauth",
            provider: "google",
            providerAccountId: faker.datatype.uuid(),
          },
        },
        ...args,
      },
    });
  },
};
