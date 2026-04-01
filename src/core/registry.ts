import type { ReportDocument } from './types.js';

// ── Field types ──

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select' | 'date_range';

export interface ReportFieldDef {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  defaultValue?: unknown;
  autoResolve?: (ctx: ReportContext) => unknown | undefined;
}

// ── Context ──

export interface ReportContext {
  userId?: string;
  orgId?: string;
  currentDashboardId?: string;
  currentMetricId?: string;
  currentAgentId?: string;
  userName?: string;
  [key: string]: unknown;
}

// ── Services (project-specific, injected into builders) ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReportServices = Record<string, any>;

// ── Builder function ──

export type ReportBuilderFn<TFields extends Record<string, unknown> = Record<string, unknown>> = (
  fields: TFields,
  services: ReportServices,
  context: ReportContext,
) => Promise<ReportDocument>;

// ── Report definition ──

export interface ReportDefinition<TFields extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  category?: string;
  fields: ReportFieldDef[];
  builder: ReportBuilderFn<TFields>;
}

// ── Registry ──

export class ReportRegistry {
  private readonly defs = new Map<string, ReportDefinition>();

  register(def: ReportDefinition): this {
    this.defs.set(def.id, def);
    return this;
  }

  get(id: string): ReportDefinition | undefined {
    return this.defs.get(id);
  }

  list(): ReportDefinition[] {
    return [...this.defs.values()];
  }

  has(id: string): boolean {
    return this.defs.has(id);
  }
}

// Re-export FieldResolution for convenience
export interface FieldResolution {
  resolved: Record<string, unknown>;
  missing: ReportFieldDef[];
}
