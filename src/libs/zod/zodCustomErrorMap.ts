import { type ZodErrorMap, ZodIssueCode } from "zod";
import { match } from "ts-pattern";

type Locale = "en" | "ja";

export const zodCustomErrorMap =
  (locale: Locale): ZodErrorMap =>
  (issue, ctx) => {
    if (locale === "en") {
      return { message: ctx.defaultError };
    }

    return match(issue)
      .with({ code: ZodIssueCode.invalid_type, received: "undefined" }, () => {
        return {
          message: "必須です",
        };
      })
      .otherwise(() => ({
        message: ctx.defaultError,
      }));
  };
