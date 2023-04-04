import { z } from "zod";
import { formatISO9075 } from "date-fns";

export const stringOrDateWithTransform = z
  .string()
  .or(z.date().transform((v) => formatISO9075(v)));
