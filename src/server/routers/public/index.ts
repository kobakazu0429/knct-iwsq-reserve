import { router } from "../../trpc";
import { eventsRouter } from "./Events";
import { eventUsersRouter } from "./EventUser";
import { TeamsRouter } from "./Teams";

/**
 * @package
 */
export const publicRouter = router({
  events: eventsRouter,
  eventUsers: eventUsersRouter,
  teams: TeamsRouter,
});
