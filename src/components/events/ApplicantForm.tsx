import { type FC, useMemo, useLayoutEffect } from "react";
import { type NextRouter } from "next/router";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStyletron } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Button } from "baseui/button";
import { type Trpc } from "../../trpc";
import { Input } from "../baseui/input";
import { Combobox } from "../baseui/Combobox";
import {
  makeGradeOptions,
  departmentLabels,
  departmentLabelToValue,
  type DepartmentLabels,
  type Department,
  Grade,
} from "../../models/EventUser";
import { createParticipantOrApplicantInput } from "../../service/EventUser";

interface FormValues {
  eventId: string;
  name: string;
  email: string;
  departmentComboboxLabel: DepartmentLabels;
  department: Department | "";
  gradeComboboxLabel: string;
  grade: Grade | "";
}

type SnackbarFunction = ReturnType<typeof useSnackbar>;

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const handleSubmitApply = ({ enqueue, dequeue }: SnackbarFunction) => {
  return (trpc: Trpc) => {
    return (router: NextRouter) => {
      return async (data: any) => {
        enqueue(
          { message: "参加申し込み中です", progress: true },
          DURATION.infinite
        );

        try {
          const parsed = createParticipantOrApplicantInput.parse(data);

          // アニメーションと作成の認知のために最低でも1秒は待つ
          const [result] = await Promise.allSettled([
            trpc.public.eventUsers.createParticipantOrApplicant.mutate(parsed),
            sleep(1000),
          ]);
          console.log(result);
          if (result.status === "rejected") throw result;

          dequeue();
          enqueue({
            message:
              "参加申し込みが完了しました。後ほどメールが届きますので確認してください。",
          });
          router.push(`/events/${data.eventId}`);
          await fetch("/api/mail/");
        } catch (error) {
          console.error(error);
          dequeue();
          enqueue({
            message:
              "エラーが発生しました。もう一度試すか、時間をおいて試してみてください。解決しない場合はTAにご相談ください。",
          });
        }
      };
    };
  };
};

interface ComboboxProps {
  onChange: () => void;
}

const DepartmentCombobox: FC<ComboboxProps> = ({ onChange }) => {
  const { setValue } = useFormContext();

  return (
    <Combobox
      label="学科／所属"
      name="departmentComboboxLabel"
      options={departmentLabels}
      errorsName="department"
      onChnage={(newLabel) => {
        // @ts-ignore
        setValue("department", departmentLabelToValue[newLabel]);
        onChange();
      }}
    />
  );
};

const GradeCombobox: FC<ComboboxProps> = ({ onChange }) => {
  const { setValue, watch, getValues } = useFormContext();
  const departmentComboboxLabelValue = watch("departmentComboboxLabel");

  const [gradeComboboxLabels, gradeLabelToValue] = useMemo(() => {
    const result = makeGradeOptions(
      // @ts-ignore
      departmentLabelToValue[departmentComboboxLabelValue]
    );
    return result;
  }, [departmentComboboxLabelValue]);

  useLayoutEffect(() => {
    const gradeComboboxLabel = getValues("gradeComboboxLabel") as
      | string
      | undefined;

    if (
      typeof gradeComboboxLabel === "undefined" ||
      gradeComboboxLabel === "" ||
      // @ts-ignore
      gradeComboboxLabels.includes(gradeComboboxLabel)
    ) {
      return;
    }

    const newGradeComboboxLabel = gradeComboboxLabels[0]!;
    setValue("gradeComboboxLabel", newGradeComboboxLabel);
    // @ts-ignore
    setValue("grade", gradeLabelToValue[newGradeComboboxLabel]);
    onChange();
  }, [
    onChange,
    departmentComboboxLabelValue,
    gradeLabelToValue,
    gradeComboboxLabels,
    setValue,
    getValues,
  ]);

  return (
    <Combobox
      label="学年"
      name="gradeComboboxLabel"
      options={gradeComboboxLabels}
      errorsName="grade"
      onChnage={(newLabel) => {
        // @ts-ignore
        setValue("grade", gradeLabelToValue[newLabel]);
        onChange();
      }}
    />
  );
};

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
}

export const ApplicantForm: FC<Props> = ({ defaultValues, onSubmit }) => {
  const [css] = useStyletron();

  const methods = useForm<FormValues>({
    defaultValues: {
      eventId: "",
      ...defaultValues,
    },
    resolver: zodResolver(createParticipantOrApplicantInput),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input type="hidden" name="eventId" />
        <Input label="名前" name="name" required />
        <Input label="メールアドレス" name="email" required />

        <div className={css({ display: "flex" })}>
          <DepartmentCombobox onChange={() => methods.trigger("email")} />
          <GradeCombobox onChange={() => methods.trigger("email")} />
        </div>

        <Button type="submit">申し込む</Button>
        <pre>
          <code>{JSON.stringify(methods.formState.errors, null, 2)}</code>
        </pre>
      </form>
    </FormProvider>
  );
};
