import { eventsRouter } from "./Events";
import { eventUsersRouter } from "./EventUser";

/**
 * @package
 */
export const publicRouter = {
  events: eventsRouter,
  eventUsers: eventUsersRouter,
};
