import type { ReportDocument } from './types.js';
export declare class PdfmakeRenderer {
    render(doc: ReportDocument): Promise<Buffer>;
    private renderCoverPage;
    private renderBlock;
}
//# sourceMappingURL=renderer.d.ts.map