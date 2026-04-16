import type { ReportDocument, BrandingConfig } from './types.js';
export declare class ReportBuilder {
    private _cover;
    private _branding;
    private _sections;
    private _currentSection;
    constructor(branding: BrandingConfig);
    title(title: string): this;
    subtitle(subtitle: string): this;
    badge(badge: string): this;
    recipientName(name: string): this;
    date(date: string): this;
    projectRef(ref: string): this;
    section(title: string): this;
    narrative(paragraphs: string[]): this;
    heading(level: 1 | 2 | 3, text: string): this;
    table(columns: Array<{
        header: string;
        align?: 'left' | 'center' | 'right';
        width?: string;
    }>, rows: string[][], caption?: string): this;
    checklist(items: Array<{
        label: string;
        detail?: string;
        quantity?: string;
        checked: boolean;
    }>, heading?: string): this;
    steps(items: Array<{
        title: string;
        description: string;
        duration?: string;
        notes?: string;
    }>, heading?: string): this;
    lineItems(columns: string[], rows: Array<{
        cells: string[];
        isBold?: boolean;
    }>, options?: {
        subtotal?: string;
        taxLabel?: string;
        taxAmount?: string;
        totalLabel?: string;
        totalAmount?: string;
    }): this;
    keyValue(pairs: Array<{
        key: string;
        value: string;
    }>): this;
    callout(variant: 'info' | 'warning' | 'success' | 'danger', text: string): this;
    divider(): this;
    build(): ReportDocument;
    private _addBlock;
    private _flushSection;
}
//# sourceMappingURL=report-builder.d.ts.map