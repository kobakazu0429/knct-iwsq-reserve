import { authProcedure, router } from "../../trpc";
import {
  getEvent,
  getEventInput,
  listEvents,
  listEventsInput,
  createEvent,
  createEventInput,
  updateEvent,
  updateEventInput,
} from "../../../service/Events";

/**
 * @package
 */
export const eventsRouter = router({
  get: authProcedure.input(getEventInput).query(async ({ ctx, input }) => {
    return getEvent({
      eventId: input.eventId,
      organizerId: ctx.session.user.roleHelper.isGuest
        ? ctx.session.user.id
        : input.organizerId,
    });
  }),

  list: authProcedure.input(listEventsInput).query(async ({ ctx, input }) => {
    return listEvents({
      hidden: input?.hidden,
      organizerId: ctx.session.user.roleHelper.isGuest
        ? ctx.session.user.id
        : input?.organizerId,
    });
  }),

  create: authProcedure
    .input(createEventInput.omit({ organizerId: true }))
    .mutation(async ({ ctx, input }) => {
      return createEvent({
        ...input,
        organizerId: ctx.session.user.id,
        hidden: ctx.session.user.roleHelper.isGuest
          ? true
          : input.hidden ?? true,
        published_at: ctx.session.user.roleHelper.isGuest
          ? undefined
          : input.published_at,
        withApprovalRequest: ctx.session.user.roleHelper.isGuest,
      });
    }),

  update: authProcedure
    .input(updateEventInput)
    .mutation(async ({ ctx, input }) => {
      return updateEvent({
        ...input,
        hidden: ctx.session.user.roleHelper.isGuest
          ? true
          : input.hidden ?? true,
        published_at: ctx.session.user.roleHelper.isGuest
          ? undefined
          : input.published_at,
        withApprovalRequest: ctx.session.user.roleHelper.isGuest,
      });
    }),
});
