import { z } from "zod";
import { addHours } from "date-fns";
import { prisma } from "../prisma";

export const applicantsToParticipantsInput = z
  .object({ eventIds: z.string().array().nonempty().optional() })
  .optional();

export const applicantsToParticipants = (
  input: z.infer<typeof applicantsToParticipantsInput> = {}
) => {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // イベントIDがinputに含まれる、もしくは全てのイベントで、
    // 開始時刻がnowより後のイベント
    const events = await tx.event.findMany({
      select: {
        id: true,
        attendance_limit: true,
        Applicant: {
          include: { EventUser: true },
          where: {
            canceled_at: null,
            OR: [
              { deadline: null },
              {
                deadline: {
                  gt: now,
                },
              },
            ],
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        Participant: {
          where: {
            canceled_at: null,
          },
        },
      },
      where: {
        ...(input?.eventIds && {
          id: {
            in: input?.eventIds,
          },
        }),
        start_time: {
          gt: now,
        },
      },
    });

    if (events.length === 0) {
      return {
        ok: true,
        message: "No events were found to process.",
      };
    }

    // イベントの参加可能人数を参加予定者が下回っている
    // かつ、申込者がいるイベント
    const shouldApplicantToParticipateEvents = events
      .filter((event) => {
        const canParticipate =
          event.attendance_limit - event.Participant.length > 0;

        const hasApplicants = event.Applicant.length > 0;
        return canParticipate && hasApplicants;
      })
      .map((event) => {
        const takeParticipate =
          event.attendance_limit - event.Participant.length;

        return {
          id: event.id,
          Applicant: event.Applicant.slice(0, takeParticipate),
        };
      });

    if (shouldApplicantToParticipateEvents.length === 0) {
      return {
        ok: true,
        message: "No shouldApplicantToParticipateEvents were found to process.",
      };
    }

    const noticeUsers: {
      id: string;
      name: string;
      email: string;
      Applicant: {
        cancel_token: string;
        deadline: Date | null;
      } | null;
    }[] = [];

    for await (const event of shouldApplicantToParticipateEvents) {
      for await (const applicant of event.Applicant) {
        noticeUsers.push(
          await tx.eventUser.update({
            where: {
              id: applicant.EventUser.id,
            },
            data: {
              Applicant: {
                update: {
                  deadline: addHours(now, 6),
                },
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              Applicant: {
                select: {
                  cancel_token: true,
                  deadline: true,
                },
              },
            },
          })
        );
      }
    }

    return { ok: true, message: "success", result: noticeUsers };
  });
};
