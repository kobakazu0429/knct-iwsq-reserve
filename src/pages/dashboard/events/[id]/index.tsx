import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useStyletron } from "baseui";
import { StatefulDataTable, StringColumn } from "baseui/data-table";
import { Heading, HeadingLevel } from "baseui/heading";
import type { AppRouterOutput } from "../../../../server/routers";
import { useTrpc } from "../../../../trpc";
import { Dashboard } from "../../../../layouts/dashboard";
import { Link } from "../../../../components/baseui/Link";
import { formatDatetime } from "../../../../utils/date";

type Event = AppRouterOutput["auth"]["events"]["get"];
type Applicant = NonNullable<Event>["Applicant"][number];
type Participant = NonNullable<Event>["Participant"][number];

const applicantColumns = [
  StringColumn({
    title: "所属",
    mapDataToValue: (data: Applicant) => data.EventUser.affiliation,
  }),
  StringColumn({
    title: "名前",
    mapDataToValue: (data: Applicant) => data.EventUser.name,
  }),
  StringColumn({
    title: "メールアドレス",
    mapDataToValue: (data: Applicant) => data.EventUser.email,
  }),
  StringColumn({
    title: "キャンセルトークン",
    mapDataToValue: (data: Applicant) => data.cancel_token,
  }),
  StringColumn({
    title: "キャンセル日時",
    mapDataToValue: (data: Applicant) =>
      data.canceled_at ? formatDatetime(data.canceled_at) : "",
  }),
  StringColumn({
    title: "参加申込期限",
    mapDataToValue: (data: Applicant) =>
      data.deadline ? formatDatetime(data.deadline) : "",
  }),
  StringColumn({
    title: "登録日時",
    mapDataToValue: (data: Applicant) =>
      formatDatetime(data.EventUser.createdAt),
  }),
  StringColumn({
    title: "更新日時",
    mapDataToValue: (data: Applicant) =>
      formatDatetime(data.EventUser.updatedAt),
  }),
];

const participantColumns = [
  StringColumn({
    title: "所属",
    mapDataToValue: (data: Participant) => data.EventUser.affiliation,
  }),
  StringColumn({
    title: "名前",
    mapDataToValue: (data: Participant) => data.EventUser.name,
  }),
  StringColumn({
    title: "メールアドレス",
    mapDataToValue: (data: Participant) => data.EventUser.email,
  }),
  StringColumn({
    title: "キャンセルトークン",
    mapDataToValue: (data: Participant) => data.cancel_token,
  }),
  StringColumn({
    title: "キャンセル日時",
    mapDataToValue: (data: Participant) =>
      data.canceled_at ? formatDatetime(data.canceled_at) : "",
  }),
  StringColumn({
    title: "登録日時",
    mapDataToValue: (data: Participant) =>
      formatDatetime(data.EventUser.createdAt),
  }),
  StringColumn({
    title: "更新日時",
    mapDataToValue: (data: Participant) =>
      formatDatetime(data.EventUser.updatedAt),
  }),
];

const EventDetailPage: NextPage = () => {
  const [css] = useStyletron();
  const router = useRouter();
  const trpc = useTrpc();
  const { data, error, isLoading } = useSWR(`/event/${router.query.id}`, () => {
    return trpc.auth.events.get.query({ eventId: router.query.id as string });
  });

  if (isLoading) {
    return (
      <Dashboard>
        <p>読み込み中です。</p>
      </Dashboard>
    );
  }

  if (!router.query.id || Array.isArray(router.query.id) || !data) {
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
      <Heading>{data.name}</Heading>
      <HeadingLevel>
        <Link href={`${router.query.id}/edit`}>編集する</Link>
        <p>ID: {data.id}</p>
        <p>状態: {data.status}</p>
        <p>公開日: {formatDatetime(data.published_at)}</p>
        <p>非公開: {data.hidden.toString()}</p>
        <p>主催者: {data.organizer.name}</p>
        <p>説明: {data.description}</p>
        <p>場所: {data.place}</p>
        <p>開始時間: {formatDatetime(data.start_time)}</p>
        <p>終了時間: {formatDatetime(data.end_time)}</p>
        <p>制限人数: {data.attendance_limit}</p>
        <p>参加予定人数: {data._count.Participant}</p>
        <p>キャンセル待ち人数: {data._count.Applicant}</p>

        <Heading>参加予定者</Heading>
        <div className={css({ height: "100%", width: "100%" })}>
          <StatefulDataTable
            columns={participantColumns}
            rows={data.Participant.map((v: any) => ({
              id: v.id,
              data: v,
            }))}
            loading={isLoading}
            loadingMessage="読み込み中"
            emptyMessage="参加予定者は見つかりませんでした"
          />
        </div>

        <Heading>キャンセル待ち者</Heading>
        <div className={css({ height: "100%", width: "100%" })}>
          <StatefulDataTable
            columns={applicantColumns}
            rows={data.Applicant.map((v: any) => ({
              id: v.id,
              data: v,
            }))}
            loading={isLoading}
            loadingMessage="読み込み中"
            emptyMessage="キャンセル待ち者は見つかりませんでした"
          />
        </div>
      </HeadingLevel>
    </Dashboard>
  );
};

export default EventDetailPage;
