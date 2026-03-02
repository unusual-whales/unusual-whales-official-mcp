import type { ZodSchema } from "zod"
import type { ApiResponse } from "../client.js"
import { formatZodError } from "../schemas/index.js"

export interface ToolResponse {
  text: string
  structuredContent?: unknown
}

export function formatToolResponse(result: ApiResponse): ToolResponse {
  if (result.error) {
    return {
      text: JSON.stringify({ error: result.error }, null, 2),
    }
  }

  return {
    text: JSON.stringify(result.data, null, 2),
    structuredContent: result.data,
  }
}

export function formatToolError(message: string): ToolResponse {
  return {
    text: JSON.stringify({ error: message }, null, 2),
  }
}

type ActionHandler<TInput> = (data: TInput) => Promise<ApiResponse>

type ActionHandlers<TInput> = {
  [K in TInput extends { action_type: infer A } ? A & string : never]: ActionHandler<
    Extract<TInput, { action_type: K }>
  >
}

export function createToolHandler<TInput>(
  schema: ZodSchema<TInput>,
  handlers: ActionHandlers<TInput>,
): (args: Record<string, unknown>) => Promise<ToolResponse> {
  return async (args: Record<string, unknown>): Promise<ToolResponse> => {
    const parsed = schema.safeParse(args)

    if (!parsed.success) {
      return formatToolError(`Invalid input: ${formatZodError(parsed.error)}`)
    }

    const data = parsed.data as TInput & { action_type: string }
    const action = data.action_type

    const handler = handlers[action as keyof typeof handlers]

    if (!handler) {
      return formatToolError(`Unknown action: ${action}`)
    }

    try {
      const result = await handler(data as never)
      return formatToolResponse(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return formatToolError(`Error executing ${action}: ${message}`)
    }
  }
}
