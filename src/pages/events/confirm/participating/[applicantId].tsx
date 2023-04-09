import Head from "next/head";
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
import { useCallback, useMemo, useState } from "react";
import { confirmableParticipantingInput } from "../../../../service/EventUser";
import { formatDatetime } from "../../../../utils/date";

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

const ParticipatingEventConfirmPage: NextPage = () => {
  const [, theme] = useStyletron();
  const router = useRouter();
  const trpc = useTrpc();
  const [isProcessing, setIsProcessing] = useState(false);
  const { enqueue, dequeue } = useSnackbar();

  const { data, error, isLoading } = useSWR(
    `/events/confirm/participating/${router.query.applicantId}`,
    () => {
      const input = confirmableParticipantingInput.parse(router.query);
      return trpc.public.eventUsers.confirmableParticipanting.query(input);
    }
  );

  const status = useMemo(() => {
    if (data?.participant.canceled_at) {
      return {
        message: "キャンセル済みです",
        canConfirm: false,
      };
    }

    if (data?.participant.created_at) {
      return {
        message: "参加申し込み済みです",
        canConfirm: false,
      };
    }
    if (data?.applicant.canceled_at) {
      return {
        message: "キャンセル済みです",
        canConfirm: false,
      };
    }

    const deadline = data?.applicant.deadline;
    if (!deadline) {
      return {
        message: "キャンセル待ち中です",
        canConfirm: false,
      };
    }

    const parsedDeadline =
      typeof deadline === "string" ? new Date(deadline) : undefined;
    if (!parsedDeadline) {
      return {
        message: "状態が不明です",
        canConfirm: false,
      };
    }

    if (parsedDeadline.getTime() < new Date().getTime()) {
      return {
        message: "期限切れです",
        canConfirm: false,
      };
    } else {
      return {
        message: "参加可能です",
        canConfirm: true,
      };
    }
  }, [data]);

  const confirm = useCallback(async () => {
    setIsProcessing(true);
    enqueue(
      { message: "参加申し込み中です", progress: true },
      DURATION.infinite
    );

    try {
      // アニメーションと作成の認知のために最低でも1秒は待つ
      const [result] = await Promise.allSettled([
        trpc.public.eventUsers.confirmParticipanting.mutate({
          applicantId: router.query.applicantId as string,
        }),
        sleep(1000),
      ]);
      console.log(result);
      if (result.status === "rejected") throw result;

      dequeue();
      enqueue({
        message: `${result.value.event.name}の参加が確定しました。`,
      });
      await router.push(`/events/${data?.event.id}`);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      dequeue();
      enqueue({
        message:
          "エラーが発生しました。もう一度試すか、時間をおいて試してみてください。解決しない場合はTAにご相談ください。",
      });
      setIsProcessing(false);
    }
  }, [
    data?.event.id,
    dequeue,
    enqueue,
    router,
    trpc.public.eventUsers.confirmParticipanting,
  ]);

  if (!data) return null;

  const event = data.event;
  const applicant = data.applicant;

  return (
    <BaseLayout isLoading={isLoading} error={error}>
      <Head>
        <title>{event.name} | スクエア</title>
      </Head>
      <Heading>{event.name}</Heading>
      <Link href={`/events/${event.id}`}>イベントの詳細を確認する</Link>
      <br />
      <Button
        type="button"
        onClick={confirm}
        disabled={!status.canConfirm}
        isLoading={isProcessing}
        isSelected={isProcessing}
        overrides={{ Root: { style: { marginTop: theme.sizing.scale600 } } }}
      >
        参加する
      </Button>
      <p>{status.message}</p>
      {applicant.deadline && (
        <p>参加申し込み期限: {formatDatetime(applicant.deadline)}</p>
      )}
      {applicant.canceled_at && (
        <p>キャンセル済み: {formatDatetime(applicant.canceled_at)}</p>
      )}
    </BaseLayout>
  );
};

export default ParticipatingEventConfirmPage;
