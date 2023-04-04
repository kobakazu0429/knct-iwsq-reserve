import { describe, test, expect, vi, beforeEach } from "vitest";
import { addHours } from "date-fns";
import { EventHelper } from "../service/EventHelper";
import { appRouter } from "./routers";
import { UserHelper } from "../service/UserHelper";

describe("trpc", () => {
  describe("router", () => {
    describe("roleGuard", () => {
      beforeEach(async () => {
        const now = new Date("2023-01-01T13:00:00.000Z");
        vi.setSystemTime(now);
        const UD1 = await UserHelper.create({ id: "UD1", role: "DENY" });
        const UG1 = await UserHelper.create({ id: "UG1", role: "GUEST" });
        const UT1 = await UserHelper.create({
          id: "UT1",
          role: "TEACHING_ASSISTANT",
        });
        const UA1 = await UserHelper.create({ id: "UA1", role: "ADMIN" });

        await EventHelper.create({
          id: "EV1",
          start_time: addHours(now, 1),
          end_time: addHours(now, 3),
          hidden: false,
          published_at: now,
          organizerId: UG1.id,
        });

        await EventHelper.create({
          id: "EV2",
          start_time: addHours(now, 1),
          end_time: addHours(now, 3),
          hidden: false,
          published_at: now,
          organizerId: UT1.id,
        });

        await EventHelper.create({
          id: "EV3",
          start_time: addHours(now, 1),
          end_time: addHours(now, 3),
          hidden: true,
          published_at: now,
          organizerId: UD1.id,
        });

        await EventHelper.create({
          id: "EV4",
          start_time: addHours(now, 1),
          end_time: addHours(now, 3),
          hidden: false,
          published_at: addHours(now, 1),
          organizerId: UA1.id,
        });
      });

      describe("trpcServerSide", async () => {
        describe("session: null", async () => {
          const trpc = appRouter.createCaller({ session: null });

          test("public", async () => {
            const events = (await trpc.public.events.list()).map((e) => ({
              id: e.id,
            }));
            expect(events).toEqual([{ id: "EV1" }, { id: "EV2" }]);
          });

          test("auth", async () => {
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV1" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"UNAUTHORIZED"');
          });

          test("admin", async () => {
            await expect(() =>
              trpc.admin.users.list()
            ).rejects.toThrowErrorMatchingInlineSnapshot('"UNAUTHORIZED"');
          });
        });

        describe("session: ID=MISSING ROLE=GUEST", async () => {
          const trpc = appRouter.createCaller({
            session: {
              expires: "MISSING",
              user: {
                id: "MISSING",
                role: "GUEST",
              },
            },
          });

          test("public", async () => {
            const events = (await trpc.public.events.list()).map((e) => ({
              id: e.id,
            }));
            expect(events).toEqual([{ id: "EV1" }, { id: "EV2" }]);
          });

          test("auth", async () => {
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV1" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV2" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV3" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV4" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
          });

          test("admin", async () => {
            await expect(() =>
              trpc.admin.users.list()
            ).rejects.toThrowErrorMatchingInlineSnapshot(
              '"required ADMIN Role at least"'
            );
          });
        });

        describe("session: ID=UG1 ROLE=GUEST", async () => {
          const trpc = appRouter.createCaller({
            session: {
              expires: "MISSING",
              user: {
                id: "UG1",
                role: "GUEST",
              },
            },
          });

          test("public", async () => {
            const events = (await trpc.public.events.list()).map((e) => ({
              id: e.id,
            }));
            expect(events).toEqual([{ id: "EV1" }, { id: "EV2" }]);
          });

          test("auth", async () => {
            expect((await trpc.auth.events.get({ eventId: "EV1" })).id).toEqual(
              "EV1"
            );
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV2" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV3" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
            await expect(() =>
              trpc.auth.events.get({ eventId: "EV4" })
            ).rejects.toThrowErrorMatchingInlineSnapshot('"No Event found"');
          });

          test("admin", async () => {
            await expect(() =>
              trpc.admin.users.list()
            ).rejects.toThrowErrorMatchingInlineSnapshot(
              '"required ADMIN Role at least"'
            );
          });
        });

        describe("session: ID=UT1 ROLE=TEACHING_ASSISTANT", async () => {
          const trpc = appRouter.createCaller({
            session: {
              expires: "MISSING",
              user: {
                id: "UT1",
                role: "TEACHING_ASSISTANT",
              },
            },
          });

          test("public", async () => {
            const events = (await trpc.public.events.list()).map((e) => ({
              id: e.id,
            }));
            expect(events).toEqual([{ id: "EV1" }, { id: "EV2" }]);
          });

          test("auth", async () => {
            expect((await trpc.auth.events.get({ eventId: "EV1" })).id).toEqual(
              "EV1"
            );
            expect((await trpc.auth.events.get({ eventId: "EV2" })).id).toEqual(
              "EV2"
            );
            expect((await trpc.auth.events.get({ eventId: "EV3" })).id).toEqual(
              "EV3"
            );
            expect((await trpc.auth.events.get({ eventId: "EV4" })).id).toEqual(
              "EV4"
            );
          });

          test("admin", async () => {
            await expect(() =>
              trpc.admin.users.list()
            ).rejects.toThrowErrorMatchingInlineSnapshot(
              '"required ADMIN Role at least"'
            );
          });
        });

        describe("session: ID=UA1 ROLE=ADMIN", async () => {
          const trpc = appRouter.createCaller({
            session: {
              expires: "MISSING",
              user: {
                id: "UA1",
                role: "ADMIN",
              },
            },
          });

          test("public", async () => {
            const events = (await trpc.public.events.list()).map((e) => ({
              id: e.id,
            }));
            expect(events).toEqual([{ id: "EV1" }, { id: "EV2" }]);
          });

          test("auth", async () => {
            expect((await trpc.auth.events.get({ eventId: "EV1" })).id).toEqual(
              "EV1"
            );
            expect((await trpc.auth.events.get({ eventId: "EV2" })).id).toEqual(
              "EV2"
            );
            expect((await trpc.auth.events.get({ eventId: "EV3" })).id).toEqual(
              "EV3"
            );
            expect((await trpc.auth.events.get({ eventId: "EV4" })).id).toEqual(
              "EV4"
            );
          });

          test("admin", async () => {
            expect((await trpc.admin.users.list()).map((v) => v.id)).toEqual([
              "UA1",
              "UD1",
              "UG1",
              "UT1",
            ]);
          });
        });
      });
    });
  });
});
