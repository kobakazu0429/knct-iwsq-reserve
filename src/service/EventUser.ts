import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { nanoid } from "nanoid";
import { addHours } from "date-fns";
import { prisma } from "../prisma";

export const createDeadline = (now: Date = new Date(), hours = 6) => {
  return addHours(now, hours);
};

export const createCancelToken = () => {
  return nanoid();
};

export const createAppliedCancelUrl = (
  baseUrl: string,
  cancelToken: string
) => {
  return `${baseUrl}/events/cancel/applied/${cancelToken}`;
};

export const createParticipatingCancelUrl = (
  baseUrl: string,
  cancelToken: string
) => {
  return `${baseUrl}/events/cancel/participating/${cancelToken}`;
};

export const createConfirmParticipatingUrl = (
  baseUrl: string,
  applicantId: string
) => {
  return `${baseUrl}/events/confirm/participating/${applicantId}`;
};

export const cancelableApplicantInput = z.object({
  cancelToken: z.string(),
});

export const cancelableParticipantInput = z.object({
  cancelToken: z.string(),
});

export const cancelableApplicant = async (
  input: z.infer<typeof cancelableApplicantInput>
) => {
  const result = await prisma.eventUser.findFirstOrThrow({
    select: {
      id: true,
      Applicant: {
        select: {
          deadline: true,
          canceled_at: true,
          Event: { select: { id: true, name: true } },
        },
      },
    },
    where: {
      Applicant: {
        cancel_token: input.cancelToken,
      },
    },
  });
  return result;
};

export const cancelableParticipant = async (
  input: z.infer<typeof cancelableParticipantInput>
) => {
  const result = await prisma.eventUser.findFirstOrThrow({
    select: {
      id: true,
      Participant: {
        select: {
          canceled_at: true,
          Event: { select: { id: true, name: true } },
        },
      },
    },
    where: {
      Participant: {
        cancel_token: input.cancelToken,
      },
    },
  });
  return result;
};

export const cancelApplicant = async (
  input: z.infer<typeof cancelableApplicantInput>
) => {
  const result = await prisma.$transaction(async (tx) => {
    const eventUser = await tx.eventUser.findFirstOrThrow({
      select: {
        Applicant: {
          select: {
            id: true,
          },
        },
      },
      where: {
        Applicant: {
          cancel_token: input.cancelToken,
        },
      },
    });
    const applicantId = eventUser.Applicant?.id;
    if (!applicantId) throw new Error("applicantId is not found.");

    return tx.applicant.update({
      select: {
        Event: { select: { name: true } },
      },
      where: {
        id: applicantId,
      },
      data: {
        canceled_at: new Date(),
      },
    });
  });

  return result;
};

export const cancelParticipant = async (
  input: z.infer<typeof cancelableParticipantInput>
) => {
  const result = await prisma.$transaction(async (tx) => {
    const eventUser = await tx.eventUser.findFirstOrThrow({
      select: {
        Participant: {
          select: {
            id: true,
          },
        },
      },
      where: {
        Participant: {
          cancel_token: input.cancelToken,
        },
      },
    });
    const participantId = eventUser.Participant?.id;
    if (!participantId) throw new Error("participantId is not found.");

    return tx.participant.update({
      select: {
        Event: { select: { name: true } },
      },
      where: {
        id: participantId,
      },
      data: {
        canceled_at: new Date(),
      },
    });
  });

  return result;
};

const commonSchema = z.object({
  eventId: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const createParticipantOrApplicantInput = z.union([
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

export type CreateParticipantOrApplicantInput = z.infer<
  typeof createParticipantOrApplicantInput
>;

export const createParticipantOrApplicant = async (
  input: CreateParticipantOrApplicantInput
) => {
  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      select: {
        id: true,
        name: true,
        description: true,
        place: true,
        start_time: true,
        end_time: true,
        attendance_limit: true,
        _count: {
          select: {
            Applicant: {
              where: {
                canceled_at: null,
                deadline: {
                  gt: new Date(),
                },
              },
            },
            Participant: {
              where: {
                canceled_at: null,
              },
            },
          },
        },
      },
      where: {
        id: input.eventId,
      },
    });

    if (!event) throw new Error("");

    const canParticipate =
      event.attendance_limit - event._count.Participant > 0;

    const selectEvent = {
      event_name: event.name,
      description: event.description,
      place: event.place,
      start_time: event.start_time,
      end_time: event.end_time,
    } as const;

    const eventUserData: Omit<
      Prisma.EventUserCreateInput,
      "id" | "mails" | "Participant" | "Applicant" | "createdAt" | "updatedAt"
    > = {
      name: input.name,
      email: input.email,
      department: input.department,
      grade: input.grade,
    };

    if (canParticipate) {
      const cancelToken = createCancelToken();
      const eventUser = await tx.eventUser.create({
        select: {
          name: true,
          email: true,
        },
        data: {
          ...eventUserData,
          Participant: {
            create: {
              cancel_token: cancelToken,
              eventId: event.id,
            },
          },
        },
      });

      return {
        type: "participating",
        user: eventUser,
        event: selectEvent,
        cancelToken,
      } as const;
    } else {
      const cancelToken = createCancelToken();
      const eventUser = await tx.eventUser.create({
        select: {
          name: true,
          email: true,
        },
        data: {
          ...eventUserData,
          Applicant: {
            create: {
              cancel_token: cancelToken,
              eventId: event.id,
            },
          },
        },
      });

      return {
        type: "applied",
        user: eventUser,
        event: selectEvent,
        cancelToken,
      } as const;
    }
  });
  return result;
};

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
            participantable_notified_at: null,
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
        id: string;
        cancel_token: string;
        canceled_at: Date | null;
        deadline_notified_at: Date | null;
        participantable_notified_at: Date | null;
        deadline: Date | null;
        Event: {
          id: string;
          name: string;
          description: string;
          place: string;
          start_time: Date;
          end_time: Date;
        };
      } | null;
    }[] = [];

    for await (const event of shouldApplicantToParticipateEvents) {
      for await (const applicant of event.Applicant) {
        const eventUser = await tx.eventUser.update({
          where: {
            id: applicant.EventUser.id,
          },
          data: {
            Applicant: {
              update: {
                deadline: createDeadline(),
                participantable_notified_at: now,
              },
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            Applicant: {
              select: {
                id: true,
                cancel_token: true,
                canceled_at: true,
                deadline_notified_at: true,
                participantable_notified_at: true,
                deadline: true,
                Event: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    place: true,
                    start_time: true,
                    end_time: true,
                  },
                },
              },
            },
          },
        });
        noticeUsers.push(eventUser);
      }
    }

    return { ok: true, message: "success", result: noticeUsers };
  });
};

export const confirmableParticipantingInput = z.object({
  applicantId: z.string(),
});

export const confirmableParticipanting = (
  input: z.infer<typeof confirmableParticipantingInput>
) => {
  return prisma.event.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      Applicant: {
        select: {
          id: true,
          deadline: true,
          canceled_at: true,
          cancel_token: true,
          EventUser: {
            select: {
              Participant: {
                select: {
                  canceled_at: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      Applicant: {
        every: {
          id: input.applicantId,
        },
      },
    },
  });
};

export const confirmParticipantingInput = z.object({
  applicantId: z.string(),
});

export const confirmParticipanting = async (
  input: z.infer<typeof confirmParticipantingInput>
) => {
  const event = await prisma.applicant.findUnique({
    select: {
      eventId: true,
    },
    where: {
      id: input.applicantId,
    },
  });

  if (!event) throw new Error("not found event");

  return prisma.applicant.update({
    data: {
      EventUser: {
        update: {
          Participant: {
            create: {
              cancel_token: createCancelToken(),
              Event: {
                connect: {
                  id: event.eventId,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: input.applicantId,
    },
    select: {
      Event: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const cancelOverDeadlineInput = z
  .object({ eventIds: z.string().array().nonempty().optional() })
  .optional();

export const cancelOverDeadline = (
  input: z.infer<typeof cancelOverDeadlineInput> = {}
) => {
  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // deadlineを過ぎているユーザー
    const users = await tx.applicant.findMany({
      select: {
        id: true,
      },
      where: {
        deadline_notified_at: null,
        deadline: {
          lte: now,
        },
        Event: {
          ...(input?.eventIds && {
            id: {
              in: input?.eventIds,
            },
          }),
        },
      },
    });

    if (users.length === 0) {
      return {
        ok: true,
        message: "No users were found to process.",
      };
    }

    const noticeUsers: {
      id: string;
      deadline: Date | null;
      canceled_at: Date | null;
      EventUser: {
        id: string;
        name: string;
        email: string;
      };
      Event: {
        id: string;
        name: string;
        description: string;
        place: string;
        start_time: Date;
        end_time: Date;
      };
    }[] = [];

    for await (const user of users) {
      const updatedUser = await tx.applicant.update({
        where: {
          id: user.id,
        },
        data: {
          canceled_at: now,
        },
        select: {
          id: true,
          deadline: true,
          canceled_at: true,
          EventUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Event: {
            select: {
              id: true,
              name: true,
              description: true,
              place: true,
              start_time: true,
              end_time: true,
            },
          },
        },
      });

      noticeUsers.push(updatedUser);
    }

    return { ok: true, message: "success", result: noticeUsers };
  });
};

export const updateParticipantableNotifiedAtInput = z.object({
  applicantIds: z.string().array().nonempty(),
});

export const updateParticipantableNotifiedAt = async (
  input: z.infer<typeof updateParticipantableNotifiedAtInput>
) => {
  const now = new Date();
  return prisma.applicant.updateMany({
    data: {
      participantable_notified_at: now,
    },
    where: {
      id: {
        in: input.applicantIds,
      },
    },
  });
};

export const updateOverDeadlineNotifiedAtInput = z.object({
  applicantIds: z.string().array().nonempty(),
});

export const updateOverDeadlineNotifiedAt = async (
  input: z.infer<typeof updateOverDeadlineNotifiedAtInput>
) => {
  const now = new Date();
  return prisma.applicant.updateMany({
    data: {
      deadline_notified_at: now,
    },
    where: {
      id: {
        in: input.applicantIds,
      },
    },
  });
};
