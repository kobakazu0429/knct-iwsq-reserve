import { formatISO9075 } from "date-fns";

export const formatDatetime = (date?: string | Date) => {
  if (!date) return "";
  if (typeof date === "string") date = new Date(date);
  return formatISO9075(date);
};
