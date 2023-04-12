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

  test("before start: can participant with twice", async () => {
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
      start_time: addHours(now, 24),
      end_time: addHours(now, 25),
      Participant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U1.id },
            {
              cancel_token: nanoid(),
              canceled_at: addHours(now, -1),
              eventUserId: U2.id,
            },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U3.id },
            { cancel_token: nanoid(), eventUserId: U4.id },
            { cancel_token: nanoid(), eventUserId: U5.id },
          ],
        },
      },
    });

    const result1 = await applicantsToParticipants();
    expect(result1.ok).toBe(true);
    expect(result1.message).toBe("success");
    expect(
      result1.result?.map((v) => ({
        userId: v.id,
        eventId: v.Applicant?.Event.id,
        deadline: v.Applicant?.deadline,
        canceled_at: v.Applicant?.canceled_at,
        deadline_notified_at: v.Applicant?.deadline_notified_at,
        participantable_notified_at: v.Applicant?.participantable_notified_at,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "canceled_at": null,
          "deadline": 2023-01-01T19:00:00.000Z,
          "deadline_notified_at": null,
          "eventId": "EV1",
          "participantable_notified_at": 2023-01-01T13:00:00.000Z,
          "userId": "U3",
        },
      ]
    `);

    const result2 = await applicantsToParticipants();
    expect(result2.ok).toBe(true);
    expect(result2.message).toBe(
      "No shouldApplicantToParticipateEvents were found to process."
    );
    expect(
      result2.result?.map((v) => ({
        userId: v.id,
        eventId: v.Applicant?.Event.id,
        deadline: v.Applicant?.deadline,
        canceled_at: v.Applicant?.canceled_at,
        deadline_notified_at: v.Applicant?.deadline_notified_at,
        participantable_notified_at: v.Applicant?.participantable_notified_at,
      }))
    ).toBe(undefined);

    // 7 = default deadline
    vi.setSystemTime(addHours(now, 7));
    await cancelOverDeadline();

    const result3 = await applicantsToParticipants();
    expect(result3.ok).toBe(true);
    expect(result3.message).toBe("success");
    expect(
      result3.result?.map((v) => ({
        userId: v.id,
        eventId: v.Applicant?.Event.id,
        deadline: v.Applicant?.deadline,
        canceled_at: v.Applicant?.canceled_at,
        deadline_notified_at: v.Applicant?.deadline_notified_at,
        participantable_notified_at: v.Applicant?.participantable_notified_at,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "canceled_at": null,
          "deadline": 2023-01-02T02:00:00.000Z,
          "deadline_notified_at": null,
          "eventId": "EV1",
          "participantable_notified_at": 2023-01-01T20:00:00.000Z,
          "userId": "U4",
        },
      ]
    `);
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
