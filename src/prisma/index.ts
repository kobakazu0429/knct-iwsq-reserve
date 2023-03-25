import { PrismaClient } from "@prisma/client";
import { isAfter, isBefore } from "date-fns";

declare global {
  // eslint-disable-next-line no-var
  var prisma: typeof _prisma | undefined;
}

const _prisma = new PrismaClient({
  log: ["query", "error", "info", "warn"],
}).$extends({
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
});

const prisma = globalThis.prisma || _prisma;
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export { prisma };
