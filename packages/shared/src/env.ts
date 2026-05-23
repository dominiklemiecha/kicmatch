import { z } from "zod";

export const nonEmptyString = z.string().min(1, "must not be empty");
