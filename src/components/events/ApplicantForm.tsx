import React, { useEffect, useMemo, type FC } from "react";
import { type NextRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { match, P } from "ts-pattern";
import { useStyletron } from "baseui";
import { useSnackbar, DURATION } from "baseui/snackbar";
import { Button } from "baseui/button";
import { type Trpc } from "../../trpc";
import { Input } from "../baseui/input";
import { Combobox } from "../baseui/Combobox";
import { ValuesType } from "utility-types";

const departmentOptions = [
  "M: 機械工学科",
  "E: 電気情報工学科",
  "C: 環境都市工学科",
  "A: 建築学科",
  "S: 専攻科",
  "卒業生",
  "保護者",
  "教員",
  "その他",
] as const;

type DepartmentOption = (typeof departmentOptions)[number];

const departmentOptionValueMapper = {
  "M: 機械工学科": "M",
  "E: 電気情報工学科": "E",
  "C: 環境都市工学科": "C",
  "A: 建築学科": "A",
  "S: 専攻科": "S",
  卒業生: "GRADUATE",
  保護者: "PARENT",
  教員: "TEACHER",
  その他: "OTHER",
} as const;

type DepartmentOptionValue =
  (typeof departmentOptionValueMapper)[DepartmentOption];

type GradeOptionValue =
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "FOURTH"
  | "FIFTH"
  | "JUNIOR"
  | "SENIOR"
  | "GRADUATE"
  | "PARENT"
  | "TEACHER"
  | "OTHER";

interface FormValues {
  eventId: string;
  name: string;
  email: string;
  department: DepartmentOptionValue | "";
  grade: GradeOptionValue;
}

type SnackbarFunction = ReturnType<typeof useSnackbar>;

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
};

export const handleSubmitApply = ({ enqueue, dequeue }: SnackbarFunction) => {
  return (trpc: Trpc) => {
    return (router: NextRouter) => {
      return async (data: FormValues) => {
        enqueue(
          { message: "参加申し込み中です", progress: true },
          DURATION.infinite
        );

        // @ts-expect-error
        if (data.department === "" || data.grade === "") {
          dequeue();
          enqueue({ message: "check your values" });
          return;
        }

        try {
          // アニメーションと作成の認知のために最低でも1秒は待つ
          const [result] = await Promise.allSettled([
            trpc.eventUsers.createParticipantOrApplicant.mutate({
              eventId: data.eventId,
              name: data.name,
              email: data.email,
              department: data.department,
              grade: data.grade,
            }),
            sleep(1000),
          ]);
          console.log(result);
          if (result.status === "rejected") throw result;

          dequeue();
          enqueue({
            message:
              "参加申し込みが完了しました。後ほどメールが届きますので確認してください。",
          });
          // router.push(`/events/${data.eventId}`);
          await fetch("/api/mail/");
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

export const ApplicantForm: FC<Props> = ({ defaultValues, onSubmit }) => {
  const [css] = useStyletron();

  const methods = useForm<FormValues>({
    defaultValues: {
      ...defaultValues,
    },
  });

  const departmentValue = methods.watch("department");

  const [gradeOptions, gradeOptionValueMapper] = useMemo(() => {
    return match(departmentValue)
      .with(P.union("M", "E", "C", "A"), () => {
        return [
          ["1年", "2年", "3年", "4年", "5年"],
          {
            "1年": "FIRST",
            "2年": "SECOND",
            "3年": "THIRD",
            "4年": "FOURTH",
            "5年": "FIFTH",
          },
        ] as const;
      })
      .with("S", () => {
        return [
          ["1年", "2年"],
          {
            "1年": "JUNIOR",
            "2年": "SENIOR",
          },
        ] as const;
      })
      .with("GRADUATE", () => {
        return [
          ["卒業生"],
          {
            卒業生: "GRADUATE",
          },
        ] as const;
      })
      .with("PARENT", () => {
        return [
          ["保護者"],
          {
            保護者: "PARENT",
          },
        ] as const;
      })
      .with("TEACHER", () => {
        return [
          ["教員"],
          {
            教員: "TEACHER",
          },
        ] as const;
      })
      .with("OTHER", () => {
        return [
          ["その他"],
          {
            その他: "OTHER",
          },
        ] as const;
      })
      .otherwise(() => [[], {}] as const);
  }, [departmentValue]);

  useEffect(() => {
    methods.setValue("grade", Object.values(gradeOptionValueMapper)[0]);
  }, [departmentValue, gradeOptionValueMapper, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <input type="hidden" name="eventId" />
        <Input label="名前" caption="caption" name="name" required />
        <Input
          label="メールアドレス"
          caption="caption"
          name="email"
          endEnhancer="@kure.kosen-ac.jp"
          required
        />

        <div className={css({ display: "flex" })}>
          <div className={css({ width: "200px", paddingRight: "8px" })}>
            <Combobox
              label="所属"
              name="department"
              options={
                departmentOptions as unknown as Array<
                  ValuesType<typeof departmentOptions>
                >
              }
              optionsValueMapper={departmentOptionValueMapper}
            />
          </div>
          <div>
            <Combobox
              label="所属"
              name="grade"
              options={
                gradeOptions as unknown as Array<
                  ValuesType<typeof gradeOptions>
                >
              }
              optionsValueMapper={gradeOptionValueMapper}
            />
          </div>
        </div>

        <Button type="submit">申し込む</Button>
      </form>
    </FormProvider>
  );
};
