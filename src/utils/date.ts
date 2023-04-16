import { formatISO9075, format } from "date-fns";
import { ja } from "date-fns/locale";
import { utcToZonedTime } from "date-fns-tz";

export const formatDatetime = (date?: string | Date | null) => {
  if (!date) return "";
  if (typeof date === "string") date = new Date(date);
  return formatISO9075(utcToZonedTime(date, "Asia/Tokyo"));
};

export const formatDatetimeWithDay = (date?: string | Date | null) => {
  if (!date) return "";
  if (typeof date === "string") date = new Date(date);
  return format(utcToZonedTime(date, "Asia/Tokyo"), "yyyy/MM/dd(E) HH:mm", {
    locale: ja,
  });
};
