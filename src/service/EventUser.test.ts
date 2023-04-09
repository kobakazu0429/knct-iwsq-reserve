import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { describe, test, expect, vi } from "vitest";
import { EventHelper } from "./EventHelper";
import { EventUserHelper } from "./EventUserHelper";
import { applicantsToParticipants, cancelOverDeadline } from "./EventUser";

describe("applicantsToParticipants", () => {
  test("after start", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, -1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U1.id }] },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U2.id },
            { cancel_token: nanoid(), eventUserId: U3.id },
          ],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("No events were found to process.");
  });

  test("before start: can participant", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    const U4 = await EventUserHelper.create({ id: "U4" });
    const U5 = await EventUserHelper.create({ id: "U5" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U1.id }] },
      },
      Applicant: {
        createMany: {
          data: [{ cancel_token: nanoid(), eventUserId: U2.id }],
        },
      },
    });
    await EventHelper.create({
      id: "EV2",
      attendance_limit: 2,
      start_time: addHours(now, 2),
      end_time: addHours(now, 4),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U3.id }] },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U4.id },
            { cancel_token: nanoid(), eventUserId: U5.id },
          ],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("success");
    expect(
      result.result?.map((v) => ({
        userId: v.id,
        eventId: v.Applicant?.Event.id,
      }))
    ).toEqual([
      {
        eventId: "EV1",
        userId: "U2",
      },
      {
        eventId: "EV2",
        userId: "U4",
      },
    ]);
  });

  test("before start: can participant with specify events", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    const U4 = await EventUserHelper.create({ id: "U4" });
    const U5 = await EventUserHelper.create({ id: "U5" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U1.id }] },
      },
      Applicant: {
        createMany: {
          data: [{ cancel_token: nanoid(), eventUserId: U2.id }],
        },
      },
    });
    await EventHelper.create({
      id: "EV2",
      attendance_limit: 2,
      start_time: addHours(now, 2),
      end_time: addHours(now, 4),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U3.id }] },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U4.id },
            { cancel_token: nanoid(), eventUserId: U5.id },
          ],
        },
      },
    });

    const result = await applicantsToParticipants({ eventIds: ["EV2"] });
    expect(result.ok).toBe(true);
    expect(result.message).toBe("success");
    expect(
      result.result?.map((v) => ({
        userId: v.id,
        eventId: v.Applicant?.Event.id,
      }))
    ).toEqual([
      {
        eventId: "EV2",
        userId: "U4",
      },
    ]);
  });

  test("before start: can not participant", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U1.id },
            { cancel_token: nanoid(), eventUserId: U2.id },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [{ cancel_token: nanoid(), eventUserId: U3.id }],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe(
      "No shouldApplicantToParticipateEvents were found to process."
    );
  });
});

describe("cancelOverDeadline", () => {
  test("all", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    const U4 = await EventUserHelper.create({ id: "U4" });
    const U5 = await EventUserHelper.create({ id: "U5" });
    const U6 = await EventUserHelper.create({ id: "U6" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 1,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U1.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, -1),
              eventUserId: U2.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U3.id,
            },
          ],
        },
      },
    });
    await EventHelper.create({
      id: "EV2",
      attendance_limit: 1,
      start_time: addHours(now, 2),
      end_time: addHours(now, 4),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U4.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, -1),
              eventUserId: U5.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U6.id,
            },
          ],
        },
      },
    });

    const result = await cancelOverDeadline();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("success");
    expect(
      result.result?.map((v) => ({
        userId: v.EventUser.id,
        eventId: v.Event.id,
      }))
    ).toEqual([
      {
        eventId: "EV1",
        userId: "U2",
      },
      {
        eventId: "EV2",
        userId: "U5",
      },
    ]);
  });

  test("specify event", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    const U4 = await EventUserHelper.create({ id: "U4" });
    const U5 = await EventUserHelper.create({ id: "U5" });
    const U6 = await EventUserHelper.create({ id: "U6" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 1,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U1.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, -1),
              eventUserId: U2.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U3.id,
            },
          ],
        },
      },
    });
    await EventHelper.create({
      id: "EV2",
      attendance_limit: 1,
      start_time: addHours(now, 2),
      end_time: addHours(now, 4),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U4.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, -1),
              eventUserId: U5.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U6.id,
            },
          ],
        },
      },
    });

    const result = await cancelOverDeadline({ eventIds: ["EV1"] });
    expect(result.ok).toBe(true);
    expect(result.message).toBe("success");
    expect(
      result.result?.map((v) => ({
        userId: v.EventUser.id,
        eventId: v.Event.id,
      }))
    ).toEqual([
      {
        eventId: "EV1",
        userId: "U2",
      },
    ]);
  });

  test("no users were found to process", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    const U4 = await EventUserHelper.create({ id: "U4" });
    const U5 = await EventUserHelper.create({ id: "U5" });
    const U6 = await EventUserHelper.create({ id: "U6" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 1,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U1.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U2.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U3.id,
            },
          ],
        },
      },
    });
    await EventHelper.create({
      id: "EV2",
      attendance_limit: 1,
      start_time: addHours(now, 2),
      end_time: addHours(now, 4),
      Participant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U4.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U5.id,
            },
            {
              cancel_token: nanoid(),
              deadline: addHours(now, 1),
              eventUserId: U6.id,
            },
          ],
        },
      },
    });

    const result = await cancelOverDeadline();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("No users were found to process.");
  });
});
