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

  const { data, error, isLoading } = useSWR(
    `/dashboard/events/${router.query.id}/edit`,
    () => {
      return trpc.events.getWithAuth.query({ id: router.query.id as string });
    }
  );

  if (!router.query.id || Array.isArray(router.query.id) || !data) {
    return <Dashboard>イベントが見つかりませんでした。</Dashboard>;
  }

  if (data?.length > 1) {
    return <Dashboard>イベントが複数見つかりました。</Dashboard>;
  }

  const event = data[0];

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
