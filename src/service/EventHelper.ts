import { faker } from "@faker-js/faker";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { UserHelper } from "./UserHelper";

export const EventHelper = {
  async create(
    args?: Partial<Prisma.EventCreateInput & { organizerId?: string }>
  ) {
    const organizerId = args?.organizerId ?? (await UserHelper.create()).id;

    if (args?.organizerId) {
      delete args?.organizerId;
    }

    return await prisma.event.create({
      data: {
        name: faker.random.word(),
        attendance_limit: parseInt(faker.random.numeric(), 10),
        place: "",
        start_time: faker.date.past(),
        end_time: faker.date.future(),
        organizer: {
          connect: {
            id: organizerId,
          },
        },
        ...args,
      },
    });
  },
};
