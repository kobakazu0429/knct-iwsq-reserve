import { adminProcedure } from "../../trpc";
import {
  updateRoles,
  updateRolesInput,
  usersList,
} from "../../../service/User";

/**
 * @package
 */
export const usersRouter = {
  list: adminProcedure.query(async () => {
    return usersList();
  }),

  update: adminProcedure.input(updateRolesInput).mutation(async ({ input }) => {
    return updateRoles(input);
  }),
};
