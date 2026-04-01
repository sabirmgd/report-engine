import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ReportBuilder } from '../core/report-builder.js';
import { PdfmakeRenderer } from '../core/renderer.js';
import type { BrandingConfig } from '../core/types.js';
import type { ReportRegistry, ReportContext, ReportServices } from '../core/registry.js';
import { FieldResolver } from '../core/field-resolver.js';
import type { FieldCollectionStrategy, CollectionCallbacks } from './strategies/types.js';

// ── Shared state per agent invocation ──

export class ReportSession {
  builder: ReportBuilder;
  constructor(branding: BrandingConfig) {
    this.builder = new ReportBuilder(branding);
  }
  reset(branding: BrandingConfig) {
    this.builder = new ReportBuilder(branding);
  }
}

// ── Options ──

export interface ReportToolOptions {
  branding: BrandingConfig;
  onQuestion?: (question: string) => Promise<string>;
  onComplete?: (buffer: Buffer, filename: string) => Promise<void>;
  registry?: ReportRegistry;
  services?: ReportServices;
  context?: ReportContext;
  strategy?: FieldCollectionStrategy;
}

// ── Create all report tools ──

export function createReportTools(options: ReportToolOptions): DynamicStructuredTool[] {
  const session = new ReportSession(options.branding);
  const renderer = new PdfmakeRenderer();

  const tools: DynamicStructuredTool[] = [
    // ── set_report_title ──
    new DynamicStructuredTool({
      name: 'set_report_title',
      description: 'Set the report title, subtitle, date, recipient name, and badge. Call this first before adding sections.',
      schema: z.object({
        title: z.string().describe('Main report title'),
        subtitle: z.string().optional().describe('Subtitle or date range'),
        date: z.string().optional().describe('Report date (e.g. "April 1, 2026")'),
        recipientName: z.string().optional().describe('Who the report is prepared for'),
        badge: z.string().optional().describe('Short badge label (e.g. "CONFIDENTIAL", "QUARTERLY")'),
      }),
      func: async ({ title, subtitle, date, recipientName, badge }) => {
        session.builder.title(title);
        if (subtitle) session.builder.subtitle(subtitle);
        if (date) session.builder.date(date);
        if (recipientName) session.builder.recipientName(recipientName);
        if (badge) session.builder.badge(badge);
        return `Report title set to "${title}"`;
      },
    }),

    // ── add_section ──
    new DynamicStructuredTool({
      name: 'add_section',
      description: 'Start a new section in the report. All blocks added after this call belong to this section.',
      schema: z.object({
        title: z.string().describe('Section title'),
      }),
      func: async ({ title }) => {
        session.builder.section(title);
        return `Section "${title}" started`;
      },
    }),

    // ── add_narrative ──
    new DynamicStructuredTool({
      name: 'add_narrative',
      description: 'Add one or more paragraphs of text to the current section.',
      schema: z.object({
        paragraphs: z.array(z.string()).describe('Array of text paragraphs'),
      }),
      func: async ({ paragraphs }) => {
        session.builder.narrative(paragraphs);
        return `Added narrative with ${paragraphs.length} paragraph(s)`;
      },
    }),

    // ── add_heading ──
    new DynamicStructuredTool({
      name: 'add_heading',
      description: 'Add a sub-heading within the current section.',
      schema: z.object({
        level: z.number().int().min(1).max(3).describe('Heading level: 1=largest, 3=smallest'),
        text: z.string().describe('Heading text'),
      }),
      func: async ({ level, text }) => {
        session.builder.heading(level as 1 | 2 | 3, text);
        return `Added h${level} heading: "${text}"`;
      },
    }),

    // ── add_table ──
    new DynamicStructuredTool({
      name: 'add_table',
      description: 'Add a data table to the current section.',
      schema: z.object({
        columns: z.array(z.object({
          header: z.string(),
          align: z.enum(['left', 'center', 'right']).optional(),
        })).describe('Column definitions'),
        rows: z.array(z.array(z.string())).describe('Table rows — each row is an array of cell strings matching column count'),
        caption: z.string().optional().describe('Optional caption below the table'),
      }),
      func: async ({ columns, rows, caption }) => {
        session.builder.table(columns, rows, caption);
        return `Added table with ${columns.length} columns and ${rows.length} rows`;
      },
    }),

    // ── add_key_value ──
    new DynamicStructuredTool({
      name: 'add_key_value',
      description: 'Add a key-value pairs block (like a summary card) to the current section.',
      schema: z.object({
        pairs: z.array(z.object({
          key: z.string().describe('Label'),
          value: z.string().describe('Value'),
        })),
      }),
      func: async ({ pairs }) => {
        session.builder.keyValue(pairs);
        return `Added ${pairs.length} key-value pairs`;
      },
    }),

    // ── add_callout ──
    new DynamicStructuredTool({
      name: 'add_callout',
      description: 'Add a highlighted callout box to draw attention to important information.',
      schema: z.object({
        variant: z.enum(['info', 'warning', 'success', 'danger']).describe('Callout style'),
        text: z.string().describe('Callout message'),
      }),
      func: async ({ variant, text }) => {
        session.builder.callout(variant, text);
        return `Added ${variant} callout`;
      },
    }),

    // ── add_checklist ──
    new DynamicStructuredTool({
      name: 'add_checklist',
      description: 'Add a checklist of items to the current section.',
      schema: z.object({
        heading: z.string().optional().describe('Optional checklist heading'),
        items: z.array(z.object({
          label: z.string(),
          checked: z.boolean(),
          detail: z.string().optional(),
        })),
      }),
      func: async ({ heading, items }) => {
        session.builder.checklist(items, heading);
        return `Added checklist with ${items.length} items`;
      },
    }),

    // ── add_divider ──
    new DynamicStructuredTool({
      name: 'add_divider',
      description: 'Add a horizontal divider line to the current section.',
      schema: z.object({}),
      func: async () => {
        session.builder.divider();
        return 'Added divider';
      },
    }),

    // ── ask_user ──
    new DynamicStructuredTool({
      name: 'ask_user',
      description: 'Ask the user a question to gather information needed for the report. Use when you need specific data or preferences.',
      schema: z.object({
        question: z.string().describe('The question to ask the user'),
      }),
      func: async ({ question }) => {
        if (options.onQuestion) {
          return await options.onQuestion(question);
        }
        return 'No answer provided';
      },
    }),

    // ── finalize_report ──
    new DynamicStructuredTool({
      name: 'finalize_report',
      description: 'Render the report to PDF and complete the report generation. Call this when all sections and content have been added.',
      schema: z.object({
        filename: z.string().describe('Output filename without extension (e.g. "q1-sales-report")'),
      }),
      func: async ({ filename }) => {
        const doc = session.builder.build();
        const buffer = await renderer.render(doc);
        const fullFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
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
    const resolver = new FieldResolver();

    tools.push(
      new DynamicStructuredTool({
        name: 'generate_report',
        description: `Generate a report from the registry. Available report types: ${registry.list().map((d) => `"${d.id}" (${d.name})`).join(', ')}. The system will automatically collect any missing required information.`,
        schema: z.object({
          reportType: z.string().describe('The report type ID from the registry'),
          preProvided: z.record(z.unknown()).optional().describe('Optional pre-provided field values'),
        }),
        func: async ({ reportType, preProvided = {} }) => {
          const def = registry.get(reportType);
          if (!def) {
            const available = registry.list().map((d) => d.id).join(', ');
            return `Unknown report type "${reportType}". Available: ${available}`;
          }

          const ctx = options.context ?? {};
          const { resolved, missing } = resolver.resolve(def.fields, ctx, preProvided as Record<string, unknown>);

          // Collect missing fields via strategy
          let collected: Record<string, unknown> = {};
          if (missing.length > 0) {
            const callbacks: CollectionCallbacks = {
              onQuestion: options.onQuestion
                ? async (q) => options.onQuestion!(q)
                : undefined,
              onPresentAll: async (fields) => {
                // fallback: ask each one by one
                const answers: Record<string, unknown> = {};
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
      }),
    );

    // ── list_available_reports ──
    tools.push(
      new DynamicStructuredTool({
        name: 'list_available_reports',
        description: 'List all available report types that can be generated.',
        schema: z.object({}),
        func: async () => {
          const reports = registry.list();
          if (reports.length === 0) return 'No report types are registered.';
          return reports
            .map((r) => `- **${r.id}** (${r.name}${r.category ? `, ${r.category}` : ''}): ${r.description}`)
            .join('\n');
        },
      }),
    );
  }

  return tools;
}
