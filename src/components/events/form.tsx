import React, { useMemo, type FC } from "react";
import { type NextRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Button } from "baseui/button";
import { type Trpc } from "../../trpc";
import { Input } from "../baseui/input";
import { Checkbox } from "../baseui/Checkbox";
import { Textarea } from "../baseui/textarea";
import { ComposedDateTimeRangePickers } from "../baseui/ComposedDateTimeRangePickers";
import { PlainButtonGroup } from "../baseui/PlainButtonGroup";
import { userRoleHelper } from "../../prisma/user";

interface FormValues {
  id?: string;
  name: string;
  description?: string;
  place: string;
  attendance_limit: number;
  start_time: any;
  end_time: any;
  hidden: boolean;
  published_at: string;
}

type SnackbarFunction = ReturnType<typeof useSnackbar>;

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const handleSubmitCreate = ({ enqueue, dequeue }: SnackbarFunction) => {
  return (trpc: Trpc) => {
    return (router: NextRouter) => {
      return async (data: FormValues) => {
        enqueue({ message: "保存中です", progress: true }, DURATION.infinite);

        try {
          // アニメーションと作成の認知のために最低でも1秒は待つ
          const [result] = await Promise.allSettled([
            trpc.events.create.mutate({
              name: data.name,
              description: data.description,
              place: data.place,
              attendance_limit: data.attendance_limit,
              start_time: data.start_time,
              end_time: data.end_time,
              hidden: data.hidden,
              published_at: data.published_at ?? data.hidden ? "" : new Date(),
            }),
            sleep(1000),
          ]);
          console.log(result);
          if (result.status === "rejected") throw result;

          dequeue();
          enqueue({ message: "保存しました" });
          router.push(`/dashboard/events/${result.value.id}`);
        } catch (error) {
          console.error(error);
        }
      };
    };
  };
};

export const handleSubmitUpdate = ({ enqueue, dequeue }: SnackbarFunction) => {
  return (trpc: Trpc) => {
    return (router: NextRouter) => {
      return async (data: FormValues) => {
        enqueue({ message: "保存中です", progress: true }, DURATION.infinite);

        try {
          // アニメーションと更新の認知のために最低でも1秒は待つ
          const [result] = await Promise.allSettled([
            trpc.events.update.mutate({
              ...data,
              published_at: data.published_at ?? data.hidden ? "" : new Date(),
            }),
            sleep(1000),
          ]);
          console.log(result);
          if (result.status === "rejected") throw result;

          dequeue();
          enqueue({ message: "保存しました" });
          router.push(`/dashboard/events/${result.value.id}`);
        } catch (error) {
          console.error(error);
        }
      };
    };
  };
};

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
}

export const EventEditor: FC<Props> = ({ defaultValues, onSubmit }) => {
  const { data: session } = useSession();
  const isGuest = useMemo(() => {
    return userRoleHelper(session?.user.role).isGuest;
  }, [session]);

  const methods = useForm<FormValues>({
    defaultValues: {
      place: "スクエア",
      attendance_limit: 10,
      hidden: isGuest,
      ...defaultValues,
    },
  });

  const watchHidden = methods.watch("hidden");

  const submitButtonText = useMemo(() => {
    if (isGuest) return "申請する";
    if (watchHidden) return "保存する";
    return "公開する";
  }, [watchHidden, isGuest]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input type="hidden" name="id" />
        <Input label="イベント名" caption="caption" name="name" required />
        <Textarea label="説明" caption="caption" name="description" />
        <Input label="場所" caption="caption" name="place" required />
        <Input
          label="人数"
          caption="caption"
          name="attendance_limit"
          type="number"
          required
        />

        <ComposedDateTimeRangePickers />

        <Checkbox label="非公開" name="hidden" disabled={isGuest} />
        {isGuest && <p>ゲストの方は「非公開」から変更できません</p>}

        <PlainButtonGroup justifyContent="right">
          <Button kind="secondary" disabled>
            保存する
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </PlainButtonGroup>
      </form>
    </FormProvider>
  );
};
