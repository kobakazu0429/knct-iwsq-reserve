import React, { type FC } from "react";
import type { NextPage } from "next";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "baseui/button";
import { useTrpc } from "../../../trpc";
import { Dashboard } from "../../../layouts/dashboard";
import { Input } from "../../../components/baseui/input";
import { Textarea } from "../../../components/baseui/textarea";
import { ComposedDateTimeRangePickers } from "../../../components/baseui/ComposedDateTimeRangePickers";
import { PlainButtonGroup } from "../../../components/baseui/PlainButtonGroup";

const Form: FC = () => {
  const trpc = useTrpc();
  const methods = useForm({
    defaultValues: { place: "スクエア", attendance_limit: 10 },
  });
  const onSubmit = async (data: any) => {
    console.log(data);
    const result = await trpc.events.create.mutate(data);
    console.log(result);

    alert(result.message);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
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

        <PlainButtonGroup justifyContent="right">
          <Button kind="secondary">保存する</Button>
          <Button>公開する</Button>
        </PlainButtonGroup>
      </form>
    </FormProvider>
  );
};
const DashboardPage: NextPage = () => {
  return (
    <Dashboard>
      <Form />
    </Dashboard>
  );
};

export default DashboardPage;
