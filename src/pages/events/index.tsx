import useSWR from "swr";
import { Heading } from "baseui/heading";
import { EventLists } from "../../components/events/lists";
import { BaseLayout } from "../../layouts/base";
import { useTrpc } from "../../trpc";

export default function Events() {
  const trpc = useTrpc();
  const { data, error, isLoading } = useSWR("/events", () => {
    return trpc.public.events.list.query();
  });

  if (!data) return null;

  return (
    <BaseLayout isLoading={isLoading} error={error}>
      <Heading styleLevel={4}>イベント</Heading>
      <EventLists
        events={data.map((event) => ({
          ...event,
          startTime: event.start_time,
          remaining: event.attendance_limit - event._count.Participant,
          waitingMembersCount: event._count.Applicant,
          url: `/events/${event.id}`,
        }))}
      />
    </BaseLayout>
  );
}
