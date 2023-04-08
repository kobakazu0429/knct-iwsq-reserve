import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSnackbar } from "baseui/snackbar";
import { useTrpc } from "../../../trpc";
import { Dashboard } from "../../../layouts/dashboard";
import {
  EventEditor,
  handleSubmitCreate,
} from "../../../components/events/EventEditor";

const DashboardPage: NextPage = () => {
  const router = useRouter();
  const trpc = useTrpc();
  const snackbar = useSnackbar();

  return (
    <Dashboard>
      <EventEditor onSubmit={handleSubmitCreate(snackbar)(trpc)(router)} />
    </Dashboard>
  );
};

export default DashboardPage;
