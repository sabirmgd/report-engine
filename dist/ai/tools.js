"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSession = void 0;
exports.createReportTools = createReportTools;
const zod_1 = require("zod");
const report_builder_js_1 = require("../core/report-builder.js");
const renderer_js_1 = require("../core/renderer.js");
const field_resolver_js_1 = require("../core/field-resolver.js");
// ── Shared state per agent invocation ──
class ReportSession {
    builder;
    constructor(branding) {
        this.builder = new report_builder_js_1.ReportBuilder(branding);
    }
    reset(branding) {
        this.builder = new report_builder_js_1.ReportBuilder(branding);
    }
}
exports.ReportSession = ReportSession;
// ── Create all report tools ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createReportTools(options) {
    const session = new ReportSession(options.branding);
    const renderer = new renderer_js_1.PdfmakeRenderer();
    // Lazy require so tsc never resolves @langchain/core's complex generics
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DynamicStructuredTool } = require('@langchain/core/tools');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = [
        // ── set_report_title ──
        new DynamicStructuredTool({
            name: 'set_report_title',
            description: 'Set the report title, subtitle, date, recipient name, and badge. Call this first before adding sections.',
            schema: zod_1.z.object({
                title: zod_1.z.string().describe('Main report title'),
                subtitle: zod_1.z.string().optional().describe('Subtitle or date range'),
                date: zod_1.z.string().optional().describe('Report date (e.g. "April 1, 2026")'),
                recipientName: zod_1.z.string().optional().describe('Who the report is prepared for'),
                badge: zod_1.z.string().optional().describe('Short badge label (e.g. "CONFIDENTIAL", "QUARTERLY")'),
            }),
            func: async (args) => {
                session.builder.title(args.title);
                if (args.subtitle)
                    session.builder.subtitle(args.subtitle);
                if (args.date)
                    session.builder.date(args.date);
                if (args.recipientName)
                    session.builder.recipientName(args.recipientName);
                if (args.badge)
                    session.builder.badge(args.badge);
                return `Report title set to "${args.title}"`;
            },
        }),
        // ── add_section ──
        new DynamicStructuredTool({
            name: 'add_section',
            description: 'Start a new section in the report. All blocks added after this call belong to this section.',
            schema: zod_1.z.object({
                title: zod_1.z.string().describe('Section title'),
            }),
            func: async (args) => {
                session.builder.section(args.title);
                return `Section "${args.title}" started`;
            },
        }),
        // ── add_narrative ──
        new DynamicStructuredTool({
            name: 'add_narrative',
            description: 'Add one or more paragraphs of text to the current section.',
            schema: zod_1.z.object({
                paragraphs: zod_1.z.array(zod_1.z.string()).describe('Array of text paragraphs'),
            }),
            func: async (args) => {
                session.builder.narrative(args.paragraphs);
                return `Added narrative with ${args.paragraphs.length} paragraph(s)`;
            },
        }),
        // ── add_heading ──
        new DynamicStructuredTool({
            name: 'add_heading',
            description: 'Add a sub-heading within the current section.',
            schema: zod_1.z.object({
                level: zod_1.z.number().int().min(1).max(3).describe('Heading level: 1=largest, 3=smallest'),
                text: zod_1.z.string().describe('Heading text'),
            }),
            func: async (args) => {
                session.builder.heading(args.level, args.text);
                return `Added h${args.level} heading: "${args.text}"`;
            },
        }),
        // ── add_table ──
        new DynamicStructuredTool({
            name: 'add_table',
            description: 'Add a data table to the current section.',
            schema: zod_1.z.object({
                columns: zod_1.z.array(zod_1.z.object({
                    header: zod_1.z.string(),
                    align: zod_1.z.enum(['left', 'center', 'right']).optional(),
                })).describe('Column definitions'),
                rows: zod_1.z.array(zod_1.z.array(zod_1.z.string())).describe('Table rows — each row is an array of cell strings matching column count'),
                caption: zod_1.z.string().optional().describe('Optional caption below the table'),
            }),
            func: async (args) => {
                session.builder.table(args.columns, args.rows, args.caption);
                return `Added table with ${args.columns.length} columns and ${args.rows.length} rows`;
            },
        }),
        // ── add_key_value ──
        new DynamicStructuredTool({
            name: 'add_key_value',
            description: 'Add a key-value pairs block (like a summary card) to the current section.',
            schema: zod_1.z.object({
                pairs: zod_1.z.array(zod_1.z.object({
                    key: zod_1.z.string().describe('Label'),
                    value: zod_1.z.string().describe('Value'),
                })),
            }),
            func: async (args) => {
                session.builder.keyValue(args.pairs);
                return `Added ${args.pairs.length} key-value pairs`;
            },
        }),
        // ── add_callout ──
        new DynamicStructuredTool({
            name: 'add_callout',
            description: 'Add a highlighted callout box to draw attention to important information.',
            schema: zod_1.z.object({
                variant: zod_1.z.enum(['info', 'warning', 'success', 'danger']).describe('Callout style'),
                text: zod_1.z.string().describe('Callout message'),
            }),
            func: async (args) => {
                session.builder.callout(args.variant, args.text);
                return `Added ${args.variant} callout`;
            },
        }),
        // ── add_checklist ──
        new DynamicStructuredTool({
            name: 'add_checklist',
            description: 'Add a checklist of items to the current section.',
            schema: zod_1.z.object({
                heading: zod_1.z.string().optional().describe('Optional checklist heading'),
                items: zod_1.z.array(zod_1.z.object({
                    label: zod_1.z.string(),
                    checked: zod_1.z.boolean(),
                    detail: zod_1.z.string().optional(),
                })),
            }),
            func: async (args) => {
                session.builder.checklist(args.items, args.heading);
                return `Added checklist with ${args.items.length} items`;
            },
        }),
        // ── add_divider ──
        new DynamicStructuredTool({
            name: 'add_divider',
            description: 'Add a horizontal divider line to the current section.',
            schema: zod_1.z.object({}),
            func: async (_args) => {
                session.builder.divider();
                return 'Added divider';
            },
        }),
        // ── ask_user ──
        new DynamicStructuredTool({
            name: 'ask_user',
            description: 'Ask the user a question to gather information needed for the report. Use when you need specific data or preferences.',
            schema: zod_1.z.object({
                question: zod_1.z.string().describe('The question to ask the user'),
            }),
            func: async (args) => {
                if (options.onQuestion) {
                    return await options.onQuestion(args.question);
                }
                return 'No answer provided';
            },
        }),
        // ── finalize_report ──
        new DynamicStructuredTool({
            name: 'finalize_report',
            description: 'Render the report to PDF and complete the report generation. Call this when all sections and content have been added.',
            schema: zod_1.z.object({
                filename: zod_1.z.string().describe('Output filename without extension (e.g. "q1-sales-report")'),
            }),
            func: async (args) => {
                const doc = session.builder.build();
                const buffer = await renderer.render(doc);
                const fullFilename = args.filename.endsWith('.pdf') ? args.filename : `${args.filename}.pdf`;
                if (options.onComplete) {
                    await options.onComplete(buffer, fullFilename);
                }
                session.reset(options.branding);
                return `Report "${fullFilename}" generated successfully (${(buffer.length / 1024).toFixed(1)} KB)`;
            },
        }),
    ];
    // ── generate_report (registry-driven) ──
    if (options.registry && options.strategy) {
        const registry = options.registry;
        const strategy = options.strategy;
        const resolver = new field_resolver_js_1.FieldResolver();
        tools.push(new DynamicStructuredTool({
            name: 'generate_report',
            description: `Generate a report from the registry. Available report types: ${registry.list().map((d) => `"${d.id}" (${d.name})`).join(', ')}. The system will automatically collect any missing required information.`,
            schema: zod_1.z.object({
                reportType: zod_1.z.string().describe('The report type ID from the registry'),
                preProvided: zod_1.z.record(zod_1.z.unknown()).optional().describe('Optional pre-provided field values'),
            }),
            func: async (args) => {
                const { reportType, preProvided = {} } = args;
                const def = registry.get(reportType);
                if (!def) {
                    const available = registry.list().map((d) => d.id).join(', ');
                    return `Unknown report type "${reportType}". Available: ${available}`;
                }
                const ctx = options.context ?? {};
                const { resolved, missing } = resolver.resolve(def.fields, ctx, preProvided);
                // Collect missing fields via strategy
                let collected = {};
                if (missing.length > 0) {
                    const callbacks = {
                        onQuestion: options.onQuestion
                            ? async (q) => options.onQuestion(q)
                            : undefined,
                        onPresentAll: async (fields) => {
                            // fallback: ask each one by one
                            const answers = {};
                            for (const f of fields) {
                                if (options.onQuestion) {
                                    answers[f.key] = await options.onQuestion(`${f.label}: `);
                                }
                            }
                            return answers;
                        },
                    };
                    collected = await strategy.collect(missing, callbacks);
                }
                const allFields = { ...resolved, ...collected };
                const services = options.services ?? {};
                const doc = await def.builder(allFields, services, ctx);
                const buffer = await renderer.render(doc);
                const filename = `${reportType}-${Date.now()}.pdf`;
                if (options.onComplete) {
                    await options.onComplete(buffer, filename);
                }
                return `Report "${def.name}" generated successfully as "${filename}" (${(buffer.length / 1024).toFixed(1)} KB)`;
            },
        }));
        // ── list_available_reports ──
        tools.push(new DynamicStructuredTool({
            name: 'list_available_reports',
            description: 'List all available report types that can be generated.',
            schema: zod_1.z.object({}),
            func: async (_args) => {
                const reports = registry.list();
                if (reports.length === 0)
                    return 'No report types are registered.';
                return reports
                    .map((r) => `- **${r.id}** (${r.name}${r.category ? `, ${r.category}` : ''}): ${r.description}`)
                    .join('\n');
            },
        }));
    }
    return tools;
}
//# sourceMappingURL=tools.js.map