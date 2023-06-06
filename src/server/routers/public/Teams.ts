import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { inviteUserToTeam } from "../../../libs/teams";

/**
 * @package
 */
export const TeamsRouter = router({
  inviteUserToTeam: publicProcedure
    .input(
      z.object({
        teamId: z.string(),
        userIds: z.string().array(),
        generalChannelId: z.string(),
        teamsAuthToken: z.string(),
        teamsSkypeTokenAsm: z.string(),
        isOwner: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await inviteUserToTeam(input);
      return { result };
    }),
});
