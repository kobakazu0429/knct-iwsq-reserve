import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const getPublicEventInput = z.object({
  eventId: z.string(),
});

const publicEventArgs = (input: { eventId?: string; now: Date }) =>
  Prisma.validator<Prisma.EventFindManyArgs>()({
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
      published_at: {
        lte: input.now,
      },
      id: input?.eventId,
      hidden: false,
      end_time: {
        gt: input.now,
      },
    },
  });

export const getPublicEvent = async (
  input: z.infer<typeof getPublicEventInput>
) => {
  const result = await prisma.event.findMany(
    publicEventArgs({ eventId: input.eventId, now: new Date() })
  );
  return result[0];
};

export const listPublicEvents = async () => {
  const result = await prisma.event.findMany(
    publicEventArgs({ now: new Date() })
  );
  return result;
};

export const getEventInput = z.object({
  eventId: z.string(),
  organizerId: z.string().optional(),
});

export const getEvent = async (input: z.infer<typeof getEventInput>) => {
  const result = await prisma.event.findFirstOrThrow({
    select: {
      id: true,
      name: true,
      description: true,
      place: true,
      start_time: true,
      end_time: true,
      attendance_limit: true,
      published_at: true,
      hidden: true,
      organizer: {
        select: {
          name: true,
        },
      },
      status: true,
      Applicant: {
        select: {
          EventUser: {
            select: {
              id: true,
              name: true,
              email: true,
              affiliation: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          deadline: true,
          canceled_at: true,
          cancel_token: true,
        },
      },
      Participant: {
        select: {
          EventUser: {
            select: {
              id: true,
              name: true,
              email: true,
              affiliation: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          canceled_at: true,
          cancel_token: true,
        },
      },
      _count: {
        select: {
          Applicant: {
            where: {
              canceled_at: null,
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
      organizerId: input.organizerId,
    },
  });

  return result;
};

export const listEventsInput = z
  .object({
    hidden: z.boolean().optional(),
    organizerId: z.string().optional(),
  })
  .optional();

export const listEvents = async (input: z.infer<typeof listEventsInput>) => {
  const result = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      place: true,
      start_time: true,
      end_time: true,
      attendance_limit: true,
      hidden: true,
      organizer: {
        select: {
          name: true,
        },
      },
      status: true,
      _count: {
        select: {
          Applicant: {
            where: {
              canceled_at: null,
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
      hidden: input?.hidden,
      organizerId: input?.organizerId,
    },
  });

  return result;
};

export const createEventInput = z.object({
  name: z.string(),
  description: z.string(),
  place: z.string(),
  hidden: z.boolean(),
  start_time: z.union([z.string().datetime(), z.date()]),
  end_time: z.union([z.string().datetime(), z.date()]),
  published_at: z.union([z.string().datetime(), z.date()]).optional(),
  attendance_limit: z.number().min(1).max(255),
  organizerId: z.string(),
  withApprovalRequest: z.boolean().optional(),
});

export const createEvent = async (input: z.infer<typeof createEventInput>) => {
  const event = await prisma.event.create({
    data: {
      name: input.name,
      description: input.description,
      place: input.place,
      hidden: input.hidden,
      start_time: input.start_time,
      end_time: input.end_time,
      published_at: input.published_at,
      attendance_limit: input.attendance_limit,
      organizer: {
        connect: {
          id: input.organizerId,
        },
      },

      ...(input.withApprovalRequest && {
        ApprovalRequest: {
          create: {
            status: "PENDING",
          },
        },
      }),
    },
  });

  return event;
};

export const updateEventInput = createEventInput.partial().merge(
  z.object({
    eventId: z.string(),
  })
);

export const updateEvent = async (input: z.infer<typeof updateEventInput>) => {
  return await prisma.event.update({
    data: {
      name: input.name,
      description: input.description,
      place: input.place,
      hidden: input.hidden,
      start_time: input.start_time,
      end_time: input.end_time,
      published_at: input.published_at,
      attendance_limit: input.attendance_limit,

      ...(input.withApprovalRequest && {
        ApprovalRequest: {
          create: {
            status: "PENDING",
          },
        },
      }),
    },
    where: {
      id: input.eventId,
    },
  });
};
