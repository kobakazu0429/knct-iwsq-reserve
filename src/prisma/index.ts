import { PrismaClient } from "@prisma/client";
import { match, P } from "ts-pattern";
import { isAfter, isBefore } from "date-fns";

const createPrisma = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "info", "warn", "query"]
        : ["error", "info", "warn"],
  })
    .$extends({
      result: {
        event: {
          status: {
            needs: {
              hidden: true,
              published_at: true,
              start_time: true,
              end_time: true,
            },
            compute(event) {
              if (event.hidden) return "非公開";
              if (!event.published_at) return "非公開";
              const today = new Date();
              if (isBefore(today, event.start_time)) return "予定";
              if (isAfter(today, event.end_time)) return "終了";

              return "公開中";
            },
          },
        },
      },
    })
    .$extends({
      result: {
        eventUser: {
          affiliation: {
            needs: {
              grade: true,
              department: true,
            },
            compute(input) {
              return match(input)
                .with(
                  {
                    grade: P.union(
                      "FIRST",
                      "SECOND",
                      "THIRD",
                      "FOURTH",
                      "FIFTH",
                      "JUNIOR",
                      "SENIOR"
                    ),
                    department: P.union("M", "E", "C", "A", "S"),
                  },
                  ({ grade, department }) => {
                    const gradeAsNumber = {
                      FIRST: 1,
                      SECOND: 2,
                      THIRD: 3,
                      FOURTH: 4,
                      FIFTH: 5,
                      JUNIOR: 1,
                      SENIOR: 2,
                    };
                    return `${department}${gradeAsNumber[grade]}`;
                  }
                )
                .with(
                  { grade: "GRADUATE", department: "GRADUATE" },
                  () => "卒業生"
                )
                .with({ grade: "PARENT", department: "PARENT" }, () => "保護者")
                .with({ grade: "TEACHER", department: "TEACHER" }, () => "教員")
                .with({ grade: "OTHER", department: "OTHER" }, () => "その他")
                .otherwise(
                  ({ grade, department }) => `不明(${grade}, ${department})`
                );
            },
          },
        },
      },
    });
};

type PrismaClientType = ReturnType<typeof createPrisma>;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientType | undefined;
}

let prisma: PrismaClientType;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    prisma = createPrisma();
  } else {
    if (!global.prisma) {
      global.prisma = createPrisma();
    }

    prisma = global.prisma;
  }
}

export { prisma };

export type Prisma = typeof prisma;
