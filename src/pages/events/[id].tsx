import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { formatISO9075 } from "date-fns";
import { Heading, HeadingLevel } from "baseui/heading";
import { useTrpc } from "../../trpc";
import {
  ApplicantForm,
  handleSubmitApply,
} from "../../components/events/ApplicantForm";
import { useSnackbar } from "baseui/snackbar";
import { BaseLayout } from "../../layouts/base";

const EventDetailPage: NextPage = () => {
  const router = useRouter();
  const trpc = useTrpc();
  const snackbar = useSnackbar();
  const eventId = router.query.id;
  const { data, error, isLoading } = useSWR(`/events/${eventId}`, () => {
    return trpc.events.get.query({ id: eventId as string });
  });

  if (!data) return null;

  const event = data[0];

  return (
    <BaseLayout isLoading={isLoading} error={error}>
      <Heading>{event.name}</Heading>
      <HeadingLevel>
        <p>説明: {event.description}</p>
        <p>場所: {event.place}</p>
        <p>開始時間: {formatISO9075(new Date(event.start_time))}</p>
        <p>終了時間: {formatISO9075(new Date(event.end_time))}</p>
        <p>remaining: {event.attendance_limit - event._count.Participant}</p>
      </HeadingLevel>
      {JSON.stringify(data, null, 2)}

      <ApplicantForm
        onSubmit={handleSubmitApply(snackbar)(trpc)(router)}
        defaultValues={{
          eventId: eventId as string,
          grade: "" as any,
          department: "",
        }}
      />
    </BaseLayout>
  );
};

export default EventDetailPage;
