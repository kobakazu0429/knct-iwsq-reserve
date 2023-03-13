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

export const userRoleHelper = (role?: User["role"]) => {
  return {
    get isAnonymous() {
      if (!role) return true;
      return false;
    },
    get isGuest() {
      if (role === "GUEST") return true;
      return false;
    },
    get isTeachingAssistant() {
      if (role === "TEACHING_ASSISTANT") return true;
      return false;
    },
    get isAdmin() {
      if (role === "ADMIN") return true;
      return false;
    },
    get isNotAnonymous() {
      if (this.isAdmin || this.isTeachingAssistant || this.isGuest) return true;
      return false;
    },
    get isNotGuest() {
      if (this.isAdmin || this.isTeachingAssistant) return true;
      return false;
    },
  };
};
