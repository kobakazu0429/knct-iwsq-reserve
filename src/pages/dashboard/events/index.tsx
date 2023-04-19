import type { NextPage } from "next";
import useSWR from "swr";
import { Dashboard } from "../../../layouts/dashboard";
import { useStyletron } from "baseui";
import {
  StatefulDataTable,
  NumericalColumn,
  StringColumn,
  CategoricalColumn,
  CustomColumn,
} from "baseui/data-table";
import { Link } from "../../../components/baseui/Link";
import { useTrpc } from "../../../trpc";
import { AppRouterOutput } from "../../../server/routers";
import { formatDatetime } from "../../../utils/date";

type Event = AppRouterOutput["auth"]["events"]["list"][number];

const columns = [
  StringColumn({
    title: "イベント名",
    mapDataToValue: (data: Event) => data.name,
  }),
  CategoricalColumn({
    title: "状態",
    mapDataToValue: (data: Event) => data.status,
  }),
  StringColumn({
    title: "開始時間",
    mapDataToValue: (data: Event) => formatDatetime(new Date(data.start_time)),
  }),
  StringColumn({
    title: "終了時間",
    mapDataToValue: (data: Event) => formatDatetime(new Date(data.end_time)),
  }),
  NumericalColumn({
    title: "制限人数",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "参加人数",
    mapDataToValue: (data: Event) => data._count.Participant,
  }),
  NumericalColumn({
    title: "キャンセル待ち",
    mapDataToValue: (data: Event) => data._count.Applicant,
  }),
  CategoricalColumn({
    title: "開催者",
    mapDataToValue: (data: Event) => data.organizer.name,
  }),
  CustomColumn<{ id: Event["id"] }, {}>({
    title: "その他",
    mapDataToValue: (data: Event) => ({
      id: data.id,
    }),
    renderCell: function Cell(props) {
      return (
        <Link href={`/dashboard/events/${props.value.id}`}>詳細を見る</Link>
      );
    },
  }),
];

const EventsPage: NextPage = () => {
  const [css] = useStyletron();
  const trpc = useTrpc();
  const { data, error, isLoading } = useSWR("events", () => {
    return trpc.auth.events.list.query();
  });

  if (error) {
    console.log("error", error);
  }

  const initialFilters = new Map([
    [
      "状態",
      { description: "終了", exclude: true, selection: new Set(["終了"]) },
    ],
  ]);

  return (
    <Dashboard>
      <div className={css({ height: "800px", width: "100%" })}>
        <StatefulDataTable
          columns={columns}
          rows={(data ?? []).map((v: any) => ({ id: v.id, data: v }))}
          initialFilters={initialFilters}
          loading={isLoading}
          loadingMessage="読み込み中"
          emptyMessage="イベントは見つかりませんでした"
        />
      </div>
    </Dashboard>
  );
};

export default EventsPage;
