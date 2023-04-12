import Head from "next/head";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useStyletron } from "baseui";
import { useSnackbar } from "baseui/snackbar";
import { ListHeading } from "baseui/list";
import { Heading, HeadingLevel } from "baseui/heading";
import { BaseLayout } from "../../layouts/base";
import { useTrpc } from "../../trpc";
import {
  ApplicantForm,
  handleSubmitApply,
} from "../../components/events/ApplicantForm";
import { notMobile, onlyMobile } from "../../style/mediaQuery";
import { formatDatetime } from "../../utils/date";

const EventDetailPage: NextPage = () => {
  const [css] = useStyletron();
  const router = useRouter();
  const trpc = useTrpc();
  const snackbar = useSnackbar();
  const eventId = router.query.id;
  const {
    data: event,
    error,
    isLoading,
  } = useSWR(`/events/${eventId}`, () => {
    return trpc.public.events.get.query({ eventId: eventId as string });
  });

  if (!event) return null;

  return (
    <BaseLayout isLoading={isLoading} error={error}>
      <Head>
        <title>{event.name} | スクエア</title>
      </Head>
      <Heading>{event.name}</Heading>
      <HeadingLevel>
        <div
          className={css({
            width: "100%",
            display: "flex",
            [onlyMobile]: {
              flexDirection: "column",
            },
          })}
        >
          <div
            className={css({ flexGrow: 1, [notMobile]: { maxWidth: "50%" } })}
          >
            <Heading>イベント詳細</Heading>
            <ListHeading
              heading="説明"
              subHeading={event.description}
              overrides={{
                SubHeadingContainer: {
                  style: {
                    whiteSpace: "pre-wrap",
                    "-webkit-line-clamp": "initial",
                  },
                },
              }}
            />
            <ListHeading heading="場所" subHeading={event.place} />
            <ListHeading
              heading="開始時間"
              subHeading={formatDatetime(new Date(event.start_time))}
            />
            <ListHeading
              heading="終了時間"
              subHeading={formatDatetime(new Date(event.end_time))}
            />
            <ListHeading
              heading="残り参加可能人数"
              subHeading={`${
                event.attendance_limit - event._count.Participant
              } 人`}
            />
            <ListHeading
              heading="キャンセル待ち人数"
              subHeading={`${event._count.Applicant} 人`}
            />
          </div>
          <div
            className={css({ flexGrow: 1, [notMobile]: { maxWidth: "50%" } })}
          >
            <Heading>申し込みフォーム</Heading>
            <ApplicantForm
              onSubmit={handleSubmitApply(snackbar)(trpc)(router)}
              defaultValues={{
                eventId: eventId as string,
              }}
            />
          </div>
        </div>
      </HeadingLevel>
    </BaseLayout>
  );
};

export default EventDetailPage;
