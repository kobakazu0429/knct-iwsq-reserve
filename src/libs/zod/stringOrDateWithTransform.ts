import { z } from "zod";
import { formatDatetime } from "../../utils/date";

export const stringOrDateWithTransform = z
  .string()
  .or(z.date().transform((v) => formatDatetime(v)));
