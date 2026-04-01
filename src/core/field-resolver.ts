import type { ReportFieldDef, ReportContext, FieldResolution } from './registry.js';

export class FieldResolver {
  resolve(
    fields: ReportFieldDef[],
    context: ReportContext,
    preProvided: Record<string, unknown> = {},
  ): FieldResolution {
    const resolved: Record<string, unknown> = {};
    const missing: ReportFieldDef[] = [];

    for (const field of fields) {
      const fromContext = field.autoResolve?.(context);
      const fromCaller = preProvided[field.key];
      const fromDefault = field.defaultValue;

      const value = fromContext ?? fromCaller ?? fromDefault;

      if (value !== undefined && value !== null) {
        resolved[field.key] = value;
      } else if (field.required) {
        missing.push(field);
      } else {
        // optional field with no value — use undefined (omit from resolved)
      }
    }

    return { resolved, missing };
  }
}
