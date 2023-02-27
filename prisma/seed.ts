import {
  PrismaClient,
  type Prisma,
  type User,
  type Event,
} from "@prisma/client";
const prisma = new PrismaClient();

const TRUNCATE = async () => {
  console.log(`Start dropping ...`);

  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);

  console.log(`Dropping finished.\n`);
};

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
  const events: Prisma.EventCreateManyInput[] = [
    {
      name: "3d printer lecture",
      place: "square",
      attendance_limit: 10,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T13:00:00.000Z"),
      end_time: new Date("2023-01-01T14:00:00.000Z"),
      organizerId: alice.id,
    },
    {
      name: "laser cutter lecture",
      place: "square",
      attendance_limit: 5,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T16:00:00.000Z"),
      end_time: new Date("2023-01-01T17:00:00.000Z"),
      organizerId: alice.id,
    },
    {
      name: "cnc lecture",
      place: "square",
      attendance_limit: 2,
      published_at: new Date("2023-01-01T12:00:00.000Z"),
      start_time: new Date("2023-01-01T18:00:00.000Z"),
      end_time: new Date("2023-01-01T19:00:00.000Z"),
      organizerId: bob.id,
    },
  ];
  const ops = events.map((event) => prisma.event.create({ data: event }));
  return prisma.$transaction(ops);
};

const seed_attendances = async ([printer, laser, cnc]: Event[]) => {
  const attendances: Prisma.AttendanceCreateManyInput[] = [
    {
      department: "M",
      grade: 1,
      name: "anzu",
      email: "anzu@example.com",
      cancel_token: "anzu_cancel_token",
      eventId: printer.id,
    },
    {
      department: "M",
      grade: 2,
      name: "baki",
      email: "baki@example.com",
      cancel_token: "baki_cancel_token",
      eventId: printer.id,
    },
    {
      department: "M",
      grade: 3,
      name: "choco",
      email: "choco@example.com",
      cancel_token: "choco_cancel_token",
      eventId: printer.id,
    },
  ];
  const ops = attendances.map((attendance) =>
    prisma.attendance.create({ data: attendance })
  );
  return prisma.$transaction(ops);
};

const main = async () => {
  await TRUNCATE();

  console.log(`Start seeding ...`);

  const [alice, bob] = await seed_users();
  const [printer, laser, cnc] = await seed_events([alice, bob]);
  const [anzu, baki, choco] = await seed_attendances([printer, laser, cnc]);

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
