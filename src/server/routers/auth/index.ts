import { router } from "../../trpc";
import { eventsRouter } from "./Event";

/**
 * @package
 */
export const authRouter = router({
  events: eventsRouter,
});
