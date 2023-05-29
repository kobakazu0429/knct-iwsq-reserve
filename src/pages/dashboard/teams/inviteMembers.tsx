import React, { type FC } from "react";
import type { NextPage } from "next";
import { useRouter, type NextRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { useStyletron } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { useTrpc, type Trpc } from "../../../trpc";
import { Dashboard } from "../../../layouts/dashboard";
import { Input } from "../../../components/baseui/input";
import { Checkbox } from "../../../components/baseui/Checkbox";
import { Textarea } from "../../../components/baseui/textarea";
import { SubmitButton } from "../../../components/baseui/SubmitButton";

interface FormValues {
  teamId: string;
  generalChannelId: string;
  teamsAuthToken: string;
  teamsSkypeTokenAsm: string;
  userIds: string;
  isOwner: boolean;
}

type SnackbarFunction = ReturnType<typeof useSnackbar>;

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const handleSubmit = ({ enqueue, dequeue }: SnackbarFunction) => {
  return (trpc: Trpc) => {
    return (router: NextRouter) => {
      return async (data: FormValues) => {
        enqueue({ message: "招待中です", progress: true }, DURATION.infinite);

        try {
          // アニメーションと作成の認知のために最低でも1秒は待つ
          const [result] = await Promise.allSettled([
            trpc.public.teams.inviteUserToTeam.mutate({
              teamId: data.teamId,
              userIds: data.userIds.split("\n"),
              generalChannelId: data.generalChannelId,
              teamsAuthToken: data.teamsAuthToken,
              teamsSkypeTokenAsm: data.teamsSkypeTokenAsm,
              isOwner: data.isOwner,
            }),
            sleep(1000),
          ]);
          console.log(result);
          if (result.status === "rejected") throw result;

          dequeue();
          enqueue({ message: "招待しました" });
          await router.push(`/dashboard/`);
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

export const InviteMembersForm: FC<Props> = ({ defaultValues, onSubmit }) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Input label="Team ID" caption="固定" name="teamId" required />
        <Input
          label="General Channel Id"
          caption="固定"
          name="generalChannelId"
          required
        />
        <Textarea
          label="Teams Auth Token"
          caption="copy from cookie"
          name="teamsAuthToken"
          placeholder="eyJ...(JWT)"
          required
        />
        <Textarea
          label="Teams Skype Token Asm"
          caption="copy from cookie"
          name="teamsSkypeTokenAsm"
          placeholder="eyJ...(JWT)"
          required
        />
        <Textarea
          label="User IDs"
          caption="line by line"
          name="userIds"
          required
        />

        <Checkbox label="権限を所有者にする" name="isOwner" />

        <SubmitButton type="submit">招待する</SubmitButton>
      </form>
    </FormProvider>
  );
};

const InviteMembers: NextPage = () => {
  const [css] = useStyletron();
  const router = useRouter();
  const trpc = useTrpc();
  const snackbar = useSnackbar();

  return (
    <Dashboard authorizedRoles="ADMIN">
      <div className={css({ height: "800px", width: "100%" })}>
        <InviteMembersForm
          defaultValues={{
            teamId: "8800555d-82d8-48de-829d-13ef23e2b5cc",
            generalChannelId:
              "19:YI_F6-iknAJN9kA24CbFKrQKhM5pfHgOQ4poT-nclTs1@thread.tacv2",
            isOwner: false,
          }}
          onSubmit={handleSubmit(snackbar)(trpc)(router)}
        />
      </div>
    </Dashboard>
  );
};

export default InviteMembers;
