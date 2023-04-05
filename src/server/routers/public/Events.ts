import { publicProcedure, router } from "../../trpc";
import {
  getPublicEvent,
  getPublicEventInput,
  listPublicEvents,
} from "./../../../service/Events";

/**
 * @package
 */
export const eventsRouter = router({
  get: publicProcedure.input(getPublicEventInput).query(async ({ input }) => {
    return getPublicEvent({
      eventId: input.eventId,
    });
  }),

  list: publicProcedure.query(async () => {
    return listPublicEvents();
  }),
});
