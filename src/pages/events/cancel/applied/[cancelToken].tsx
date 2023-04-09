import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useStyletron } from "baseui";
import { Heading } from "baseui/heading";
import { useTrpc } from "../../../../trpc";
import { Link } from "../../../../components/baseui/Link";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Button } from "baseui/button";
import { BaseLayout } from "../../../../layouts/base";
import { useCallback } from "react";
import { cancelableApplicantInput } from "../../../../service/EventUser";
import { formatDatetime } from "../../../../utils/date";

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

const AppliedEventCancelPage: NextPage = () => {
  const [, theme] = useStyletron();
  const router = useRouter();
  const trpc = useTrpc();
  const { enqueue, dequeue } = useSnackbar();
  const { data, error, isLoading } = useSWR(
    `/events/cancel/applied/${router.query.cancelToken}`,
    () => {
      const input = cancelableApplicantInput.parse(router.query);
      return trpc.public.eventUsers.cancelableApplicant.query(input);
    }
  );

  const cancel = useCallback(async () => {
    enqueue({ message: "キャンセル中です", progress: true }, DURATION.infinite);

    try {
      // アニメーションと作成の認知のために最低でも1秒は待つ
      const [result] = await Promise.allSettled([
        trpc.public.eventUsers.cancelApplicant.mutate({
          cancelToken: router.query.cancelToken as string,
        }),
        sleep(1000),
      ]);
      console.log(result);
      if (result.status === "rejected") throw result;

      dequeue();
      enqueue({
        message: `${result.value.event.name}の申し込みをキャンセルしました。`,
      });
      // router.push(`/events/${data.eventId}`);
      // await fetch("/api/mail/");
    } catch (error) {
      console.error(error);
    }
  }, [
    dequeue,
    enqueue,
    router.query.cancelToken,
    trpc.public.eventUsers.cancelApplicant,
  ]);

  const event = data?.event;
  const applicant = data?.applicant;

  return (
    <BaseLayout isLoading={isLoading} error={error}>
      <Heading>{event?.name}</Heading>
      <Link href={`/events/${event?.id}`}>イベントの詳細を確認する</Link>
      <br />
      <Button
        type="button"
        onClick={cancel}
        disabled={!!applicant?.canceled_at}
        overrides={{ Root: { style: { marginTop: theme.sizing.scale600 } } }}
      >
        キャンセルする
      </Button>
      <p>キャンセル済み: {formatDatetime(applicant?.canceled_at)}</p>
    </BaseLayout>
  );
};

export default AppliedEventCancelPage;