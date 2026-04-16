import type { ReportDocument } from './types.js';
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select' | 'date_range' | 'entity_select';
export interface ReportFieldDef {
    key: string;
    label: string;
    description?: string;
    type: FieldType;
    required: boolean;
    options?: string[];
    defaultValue?: unknown;
    /** For entity_select fields — tells the frontend which entity list to fetch (e.g. 'dashboard', 'metric') */
    entityType?: string;
    autoResolve?: (ctx: ReportContext) => unknown | undefined;
}
export interface ReportContext {
    userId?: string;
    orgId?: string;
    currentDashboardId?: string;
    currentMetricId?: string;
    currentAgentId?: string;
    userName?: string;
    [key: string]: unknown;
}
export type ReportServices = Record<string, any>;
export type ReportBuilderFn<TFields extends Record<string, unknown> = Record<string, unknown>> = (fields: TFields, services: ReportServices, context: ReportContext) => Promise<ReportDocument>;
export interface ReportDefinition<TFields extends Record<string, unknown> = Record<string, unknown>> {
    id: string;
    name: string;
    description: string;
    category?: string;
    fields: ReportFieldDef[];
    builder: ReportBuilderFn<TFields>;
}
export declare class ReportRegistry {
    private readonly defs;
    register(def: ReportDefinition): this;
    get(id: string): ReportDefinition | undefined;
    list(): ReportDefinition[];
    has(id: string): boolean;
}
export interface FieldResolution {
    resolved: Record<string, unknown>;
    missing: ReportFieldDef[];
}
//# sourceMappingURL=registry.d.ts.map