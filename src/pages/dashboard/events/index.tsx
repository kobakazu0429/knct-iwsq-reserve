import type { NextPage } from "next";
import useSWR from "swr";
import { Dashboard } from "../../../layouts/dashboard";
import { useStyletron } from "baseui";
import {
  StatefulDataTable,
  NumericalColumn,
  StringColumn,
} from "baseui/data-table";

type RowDataT = {
  id: string;
  name: string;
  description: string | null;
  place: string;
  start_time: string;
  end_time: string;
  attendance_limit: number;
};

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
    mapDataToValue: (data: RowDataT) => data.name,
  }),
  StringColumn({
    title: "開始時間",
    mapDataToValue: (data: RowDataT) =>
      dateFormatter.format(new Date(data.start_time)),
  }),
  StringColumn({
    title: "終了時間",
    mapDataToValue: (data: RowDataT) =>
      dateFormatter.format(new Date(data.end_time)),
  }),
  NumericalColumn({
    title: "制限人数",
    mapDataToValue: (data: RowDataT) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "申込数",
    mapDataToValue: (data: RowDataT) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "キャンセル待ち",
    mapDataToValue: (data: RowDataT) => data.attendance_limit,
  })
];

const DashboardPage: NextPage = () => {
  const [css] = useStyletron();
  const { data, error, isLoading } = useSWR("hello", () => {
    return fetch("/api/events").then((res) => res.json());
  });

  console.log(data);

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
