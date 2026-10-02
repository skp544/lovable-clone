import { z } from "zod";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware";

export const validateId = validateParams(z.object({ id: z.uuid() }));

export const createProjectSchema = z.object({
  value: z.string().trim().min(1, "value is required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const validateCreateProject = validateBody(createProjectSchema);
