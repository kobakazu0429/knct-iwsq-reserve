import { faker } from "@faker-js/faker";
import { type Prisma, Grade, Department } from "@prisma/client";
import { prisma } from "../prisma";

// TODO: fixed with seed
const randomGrade = () => {
  const grades = Object.values(Grade);
  return grades[Math.floor(Math.random() * grades.length)];
};

// TODO: fixed with seed
const randomDepartment = () => {
  const departments = Object.values(Department);
  return departments[Math.floor(Math.random() * departments.length)];
};

export const EventUserHelper = {
  async create(args?: Partial<Prisma.EventUserCreateInput>) {
    return await prisma.eventUser.create({
      data: {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        grade: randomGrade(),
        department: randomDepartment(),
        ...args,
      },
    });
  },
};
