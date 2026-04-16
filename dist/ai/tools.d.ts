import { ReportBuilder } from '../core/report-builder.js';
import type { BrandingConfig } from '../core/types.js';
import type { ReportRegistry, ReportContext, ReportServices } from '../core/registry.js';
import type { FieldCollectionStrategy } from './strategies/types.js';
export declare class ReportSession {
    builder: ReportBuilder;
    constructor(branding: BrandingConfig);
    reset(branding: BrandingConfig): void;
}
export interface ReportToolOptions {
    branding: BrandingConfig;
    onQuestion?: (question: string) => Promise<string>;
    onComplete?: (buffer: Buffer, filename: string) => Promise<void>;
    registry?: ReportRegistry;
    services?: ReportServices;
    context?: ReportContext;
    strategy?: FieldCollectionStrategy;
}
export declare function createReportTools(options: ReportToolOptions): any[];
//# sourceMappingURL=tools.d.ts.map