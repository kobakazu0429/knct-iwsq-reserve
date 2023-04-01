import { type Prisma, type User, type Event } from "@prisma/client";
import { prisma } from "../src/prisma";
import { TRUNCATE } from "./reset";

const seed_users = async () => {
  const users: Prisma.UserCreateInput[] = [
    {
      name: "alice",
      email: "alice@example.com",
      role: "TEACHING_ASSISTANT",
    },
    {
      name: "bob",
      email: "bob@example.com",
      role: "GUEST",
    },
  ];
  const ops = users.map((user) => prisma.user.create({ data: user }));
  return prisma.$transaction(ops);
};

const seed_events = async ([alice, bob]: User[]) => {
  const events: Prisma.EventCreateInput[] = [
    {
      name: "3d printer lecture",
      place: "square",
      attendance_limit: 2,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T13:00:00.000Z"),
      end_time: new Date("2023-01-01T14:00:00.000Z"),
      organizer: {
        connect: { id: alice.id },
      },
      Participant: {
        create: [
          {
            EventUser: {
              create: {
                department: "M",
                grade: "FIRST",
                name: "anzu",
                email: "anzu@example.com",
              },
            },
            cancel_token: "anzu_cancel_token",
          },
        ],
      },
      Applicant: {
        create: [
          {
            EventUser: {
              create: {
                department: "M",
                grade: "SECOND",
                name: "baki",
                email: "baki@example.com",
              },
            },
            cancel_token: "baki_cancel_token",
          },
        ],
      },
    },
    {
      name: "laser cutter lecture",
      place: "square",
      attendance_limit: 1,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T16:00:00.000Z"),
      end_time: new Date("2023-01-01T17:00:00.000Z"),
      organizer: {
        connect: { id: alice.id },
      },
      Participant: {
        create: [
          {
            EventUser: {
              create: {
                department: "M",
                grade: "THIRD",
                name: "choco",
                email: "choco@example.com",
              },
            },
            cancel_token: "choco_cancel_token",
          },
        ],
      },
    },
    {
      name: "cnc lecture",
      place: "square",
      attendance_limit: 2,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T18:00:00.000Z"),
      end_time: new Date("2023-01-01T19:00:00.000Z"),
      organizer: {
        connect: { id: bob.id },
      },
    },
  ];
  const ops = events.map((event) => prisma.event.create({ data: event }));
  return prisma.$transaction(ops);
};

// const seed_attendances = async ([printer, laser, cnc]: Event[]) => {
//   const eventUsers: Prisma.EventUserCreateManyInput[] = [
//     {
//       department: "M",
//       grade: "FIRST",
//       name: "anzu",
//       email: "anzu@example.com",
//       // cancel_token: "anzu_cancel_token",
//       participantId: "1",
//     },
//   ];
//   const ops = attendances.map((attendance) =>
//     prisma.attendance.create({ data: attendance })
//   );
//   return prisma.$transaction(ops);
// };

const main = async () => {
  console.info(`Start dropping ...`);
  await TRUNCATE();
  console.info(`Dropping finished.\n`);

  console.log(`Start seeding ...`);

  const [alice, bob] = await seed_users();
  const [printer, laser, cnc] = await seed_events([alice, bob]);
  // const [anzu, baki, choco] = await seed_attendances([printer, laser, cnc]);

  console.log(`Seeding finished.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
