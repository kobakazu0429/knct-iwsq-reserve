import { type User } from "@prisma/client";
export { Role } from "@prisma/client";

export const roles = ["ADMIN", "TEACHING_ASSISTANT", "GUEST", "DENY"] as const;

export const userRoleExtender = (role: User["role"]): User["role"][] => {
  if (role === "DENY") {
    return ["DENY"];
  } else if (role === "GUEST") {
    return ["GUEST"];
  } else if (role === "TEACHING_ASSISTANT") {
    return ["GUEST", "TEACHING_ASSISTANT"];
  } else if (role === "ADMIN") {
    return ["GUEST", "TEACHING_ASSISTANT", "ADMIN"];
  } else {
    throw new Error("role must be User['role']");
  }
};

export const userRoleHelper = (role?: User["role"]) => {
  return {
    get isAnonymous() {
      if (!role) return true;
      return false;
    },
    get isDeny() {
      return role === "DENY";
    },
    get isGuest() {
      return role === "GUEST";
    },
    get isTeachingAssistant() {
      return role === "TEACHING_ASSISTANT";
    },
    get isAdmin() {
      return role === "ADMIN";
    },
  };
};
