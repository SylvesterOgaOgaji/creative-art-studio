import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

/** The metrics endpoint intentionally accepts no query parameters. */
export const metricsQuerySchema = z.object({}).strict();

export function validateQuery<T extends z.ZodTypeAny>(
  schema: T
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: "invalid_request",
        message: "Query parameters are not supported for this endpoint.",
      });
      return;
    }

    res.locals.validatedQuery = result.data;
    next();
  };
}

export type MetricsQuery = z.infer<typeof metricsQuerySchema>;

export const requestValidationContract = {
  metrics: {
    method: "GET",
    path: "/metrics",
    query: metricsQuerySchema,
  },
} as const;
