import { router } from "../../trpc";
import { usersRouter } from "./Users";

/**
 * @package
 */
export const adminRouter = router({
  users: usersRouter,
});
