import { NextResponse } from "next/server";
import { ZodError } from "zod";

export abstract class BaseController {
  protected handleSuccess<T>(data: T, status = 200): NextResponse {
    return NextResponse.json(
      {
        ok: true,
        data,
      },
      { status }
    );
  }

  protected handleValidationError(error: ZodError): NextResponse {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation error",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  protected handleError(
    error: any,
    contextName: string,
    defaultStatus = 500
  ): NextResponse {
    console.error(`[Controller Error] [${contextName}]:`, error);

    if (error instanceof ZodError) {
      return this.handleValidationError(error);
    }

    const message = error?.message || "Internal server error";
    const status = error?.status || defaultStatus;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status }
    );
  }
}
