import { router } from "../../trpc";
import { eventsRouter } from "./Events";
import { eventUsersRouter } from "./EventUser";

/**
 * @package
 */
export const publicRouter = router({
  events: eventsRouter,
  eventUsers: eventUsersRouter,
});
