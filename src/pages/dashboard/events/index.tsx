import type { NextPage } from "next";
import useSWR from "swr";
import { Dashboard } from "../../../layouts/dashboard";
import { useStyletron } from "baseui";
import {
  StatefulDataTable,
  NumericalColumn,
  StringColumn,
} from "baseui/data-table";
import { useTrpc } from "../../../trpc";

import { AppRouterOutput } from "../../../server/routers";

type Event = AppRouterOutput["events"]["get"][number];

const dateFormatter = new Intl.DateTimeFormat("ja-Jp", {
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const columns = [
  StringColumn({
    title: "イベント名",
    mapDataToValue: (data: Event) => data.name,
  }),
  StringColumn({
    title: "開始時間",
    mapDataToValue: (data: Event) =>
      dateFormatter.format(new Date(data.start_time)),
  }),
  StringColumn({
    title: "終了時間",
    mapDataToValue: (data: Event) =>
      dateFormatter.format(new Date(data.end_time)),
  }),
  NumericalColumn({
    title: "制限人数",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "申込数",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "キャンセル待ち",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  StringColumn({
    title: "開催者",
    mapDataToValue: (data: Event) => data.organizer?.name ?? "",
  }),
];

const DashboardPage: NextPage = () => {
  const [css] = useStyletron();
  const trpc = useTrpc();
  const { data, error, isLoading } = useSWR("hello", () => {
    return trpc.events.get.query();
  });

  if (error) {
    console.log("error", error);
  }

  if (!isLoading) {
    console.log("data", data);
  }

  return (
    <Dashboard>
      <div className={css({ height: "800px", width: "100%" })}>
        <StatefulDataTable
          columns={columns}
          rows={(data ?? []).map((v: any) => ({ id: v.id, data: v }))}
          emptyMessage="custom empty message"
        />
      </div>
    </Dashboard>
  );
};

export default DashboardPage;
