import { type User } from "@prisma/client";

export const userRoleExtender = (role: User["role"]): User["role"][] => {
  if (role === "GUEST") {
    return ["GUEST"];
  } else if (role === "TEACHING_ASSISTANT") {
    return ["GUEST", "TEACHING_ASSISTANT"];
  } else if (role === "ADMIN") {
    return ["GUEST", "TEACHING_ASSISTANT", "ADMIN"];
  } else {
    throw new Error("role must be User['role']");
  }
};
