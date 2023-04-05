import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useSnackbar } from "baseui/snackbar";
import { useTrpc } from "../../../../trpc";
import { Dashboard } from "../../../../layouts/dashboard";
import {
  EventEditor,
  handleSubmitUpdate,
} from "../../../../components/events/form";

const EventEditPage: NextPage = () => {
  const router = useRouter();
  const trpc = useTrpc();
  const snackbar = useSnackbar();

  const {
    data: event,
    error,
    isLoading,
  } = useSWR(`/dashboard/events/${router.query.id}/edit`, () => {
    return trpc.auth.events.get.query({ eventId: router.query.id as string });
  });

  if (isLoading) {
    return (
      <Dashboard>
        <p>読み込み中です。</p>
      </Dashboard>
    );
  }

  if (!router.query.id || Array.isArray(router.query.id) || !event) {
    return <Dashboard>イベントが見つかりませんでした。</Dashboard>;
  }

  if (error) {
    return (
      <Dashboard>
        <p>エラーが発生しました。</p>
        <div>{error}</div>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <EventEditor
        defaultValues={{
          id: event.id,
          name: event.name,
          description: event.description ?? "",
          place: event.place,
          attendance_limit: event.attendance_limit,
          start_time: event.start_time,
          end_time: event.end_time,
          hidden: event.hidden,
          // published_at: event.published_at ?? data.hidden ? "" : new Date(),
        }}
        onSubmit={handleSubmitUpdate(snackbar)(trpc)(router)}
      />
    </Dashboard>
  );
};

export default EventEditPage;
