import { z } from "zod";
import { validateParams } from "../middleware/validate.middleware";

export const validateId = validateParams(z.object({ id: z.uuid() }));
