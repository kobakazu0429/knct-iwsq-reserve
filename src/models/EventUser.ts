import { z } from "zod";
import { match, P } from "ts-pattern";
import type { Department } from "@prisma/client";
export { Department, Grade } from "@prisma/client";

export const departmentLabels = [
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

export type DepartmentLabels = (typeof departmentLabels)[number];

export const departmentLabelToValue = {
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

export type DepartmentLabelToValue =
  (typeof departmentLabelToValue)[DepartmentLabels];

const commonSchema = z.object({
  eventId: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const createParticipantOrApplicantSchema = z.union([
  commonSchema.omit({ email: true }).merge(
    z.object({
      email: z
        .string()
        // .email()
        .endsWith(
          "@kurekosen-ac.jp",
          "学生は @kurekosen-ac.jp で終わるメールアドレスを入力してください。"
        ),
      department: z.enum(["M", "E", "C", "A", "S"]),
      grade: z.enum([
        "FIRST",
        "SECOND",
        "THIRD",
        "FOURTH",
        "FIFTH",
        "JUNIOR",
        "SENIOR",
      ]),
    })
  ),
  commonSchema.merge(
    z.object({
      department: z.literal("GRADUATE"),
      grade: z.literal("GRADUATE"),
    })
  ),
  commonSchema.merge(
    z.object({
      department: z.literal("PARENT"),
      grade: z.literal("PARENT"),
    })
  ),
  commonSchema.merge(
    z.object({
      department: z.literal("TEACHER"),
      grade: z.literal("TEACHER"),
    })
  ),
  commonSchema.merge(
    z.object({
      department: z.literal("OTHER"),
      grade: z.literal("OTHER"),
    })
  ),
]);

export type CreateParticipantOrApplicantSchema = z.infer<
  typeof createParticipantOrApplicantSchema
>;

export const makeGradeOptions = (department: Department) => {
  return match(department)
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
};
