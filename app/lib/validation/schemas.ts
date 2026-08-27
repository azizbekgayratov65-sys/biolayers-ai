import { z } from "zod";

/**
 * Common validation utilities and reusable schemas
 */

export const nonEmptyString = z.string().min(1, "This field is required");
export const optionalString = z.string().optional();
export const uuidSchema = z.string().uuid("Invalid ID format");
export const positiveInt = z.number().int().positive("Must be a positive integer");
export const nonNegativeInt = z.number().int().nonnegative("Must be a non-negative integer");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: Request): Promise<z.infer<T>> => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError("The request body must contain valid JSON.");
    }
    const result = schema.safeParse(body);
    if (!result.success) {
      const errors = result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new ValidationError(errors);
    }
    return result.data;
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (request: Request): z.infer<T> => {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });
    const result = schema.safeParse(query);
    if (!result.success) {
      const errors = result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new ValidationError(errors);
    }
    return result.data;
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (params: Promise<Record<string, string>>): Promise<z.infer<T>> => {
    return params.then(p => {
      const result = schema.safeParse(p);
      if (!result.success) {
        const errors = result.error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
        throw new ValidationError(errors);
      }
      return result.data;
    });
  };
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleValidationError(error: unknown): { message: string; status: number } {
  if (error instanceof ValidationError) {
    return { message: error.message, status: 400 };
  }
  if (error instanceof z.ZodError) {
    const errors = error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join("; ");
    return { message: errors, status: 400 };
  }
  return { message: "Invalid request", status: 400 };
}