// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmakeModule = require('pdfmake/build/pdfmake') as {
  virtualfs: { storage: Record<string, string | Buffer> };
  fonts: Record<string, unknown>;
  createPdf: (def: import('pdfmake/interfaces').TDocumentDefinitions) => { getBuffer: () => Promise<Buffer> };
};

import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import type { ReportDocument, DocumentBlock } from './types.js';
import { buildPalette, buildPdfStyles, TYPOGRAPHY, SPACING, type DocumentPalette } from './design-tokens.js';
import { INTER_FONTS, loadFontVfs } from './fonts/font-loader.js';
import { fetchLogoAsDataUri } from './pdf-logo-fetcher.js';

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max - 3) + '...';
}

export class PdfmakeRenderer {
  async render(doc: ReportDocument): Promise<Buffer> {
    const { cover, branding, sections } = doc;
    const palette = buildPalette(branding.primaryColor, branding.secondaryColor);
    const logoDataUri = branding.logoUrl ? await fetchLogoAsDataUri(branding.logoUrl) : null;
    const companyName = branding.companyName ?? 'Report';

    const content: Content[] = [];

    // Cover header — no forced page break, sections flow on same page
    content.push(this.renderCoverPage(doc, palette, logoDataUri));
    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: SPACING.contentWidth, y2: 0, lineWidth: 0.5, lineColor: palette.borderLight }],
      margin: [0, 16, 0, 24] as [number, number, number, number],
    });

    // Sections
    for (const section of sections) {
      content.push({
        stack: [
          {
            text: section.title,
            fontSize: TYPOGRAPHY.sectionTitle,
            bold: true,
            color: palette.accent,
            margin: [0, SPACING.sectionGapBefore, 0, 4] as [number, number, number, number],
          },
          {
            canvas: [{
              type: 'line', x1: 0, y1: 0, x2: SPACING.contentWidth, y2: 0,
              lineWidth: 0.5, lineColor: palette.borderLight,
            }],
            margin: [0, 0, 0, SPACING.sectionGapAfter] as [number, number, number, number],
          },
        ],
      });
      for (const block of section.blocks) {
        content.push(...this.renderBlock(block, palette));
      }
    }

    const styles = buildPdfStyles(palette);
    const docTitle = cover.title;

    const docDefinition: TDocumentDefinitions = {
      content,
      styles,
      defaultStyle: {
        font: 'Inter',
        fontSize: TYPOGRAPHY.body,
        lineHeight: 1.5,
        color: palette.textBody,
      },
      pageSize: 'LETTER',
      pageMargins: SPACING.pageMargins,
      info: {
        title: docTitle,
        author: companyName,
        subject: cover.subtitle ?? '',
      },
      header: (currentPage: number) => {
        if (currentPage <= 1) return null;
        return logoDataUri
          ? {
              columns: [
                { image: logoDataUri, width: 16, margin: [0, 2, 6, 0] as [number, number, number, number] },
                { text: companyName, fontSize: 8, color: palette.textMuted, margin: [0, 4, 0, 0] as [number, number, number, number] },
              ],
              columnGap: 0,
              margin: [SPACING.pageMargins[0], 20, SPACING.pageMargins[2], 0] as [number, number, number, number],
            }
          : {
              text: companyName,
              fontSize: 8,
              color: palette.textMuted,
              margin: [SPACING.pageMargins[0], 24, SPACING.pageMargins[2], 0] as [number, number, number, number],
            };
      },
      footer: (currentPage: number, pageCount: number) => ({
        stack: [
          {
            canvas: [{
              type: 'line', x1: 0, y1: 0, x2: SPACING.contentWidth, y2: 0,
              lineWidth: 0.3, lineColor: palette.borderLight,
            }],
            margin: [SPACING.pageMargins[0], 0, 0, SPACING.footerRuleMarginBottom] as [number, number, number, number],
          },
          {
            columns: [
              {
                text: `${truncate(docTitle, 40)}  |  ${companyName}`,
                fontSize: TYPOGRAPHY.footer, color: palette.textMuted, alignment: 'left' as const,
                margin: [SPACING.pageMargins[0], 0, 0, 0] as [number, number, number, number],
              },
              {
                text: `Page ${currentPage} of ${pageCount}`,
                fontSize: TYPOGRAPHY.footer, color: palette.textMuted, alignment: 'right' as const,
                margin: [0, 0, SPACING.pageMargins[2], 0] as [number, number, number, number],
              },
            ],
          },
        ],
      }),
    };

    const vfs = loadFontVfs();
    for (const [filename, buf] of Object.entries(vfs)) {
      pdfmakeModule.virtualfs.storage[filename] = buf;
    }
    pdfmakeModule.fonts = INTER_FONTS;
    const pdfDoc = pdfmakeModule.createPdf(docDefinition);
    return Buffer.from(await pdfDoc.getBuffer());
  }

  private renderCoverPage(doc: ReportDocument, palette: DocumentPalette, logoDataUri: string | null): Content {
    const { cover, branding } = doc;
    const items: Content[] = [];

    // Left accent strip
    items.push({
      canvas: [{ type: 'rect', x: -SPACING.pageMargins[0], y: -SPACING.pageMargins[1], w: 4, h: 900, color: palette.accent }],
      absolutePosition: { x: 0, y: 0 },
    } as Content);

    // Logo
    if (logoDataUri) {
      items.push({ image: logoDataUri, fit: [160, SPACING.coverLogoMaxHeight], margin: [0, 0, 0, 12] as [number, number, number, number] });
    }

    // Company name
    if (branding.companyName) {
      items.push({
        text: branding.companyName,
        fontSize: TYPOGRAPHY.coverCompanyName, bold: true, color: palette.accent,
        margin: [0, logoDataUri ? 0 : 20, 0, 2] as [number, number, number, number],
      });
    }

    // Tagline
    if (branding.tagline) {
      items.push({ text: branding.tagline, fontSize: TYPOGRAPHY.coverTagline, color: palette.textCaption, margin: [0, 0, 0, 4] as [number, number, number, number] });
    }

    // Contact line
    const contactParts = [branding.phone, branding.email, branding.website].filter(Boolean) as string[];
    if (contactParts.length > 0) {
      items.push({ text: contactParts.join('   |   '), fontSize: TYPOGRAPHY.coverContact, color: palette.textMuted, margin: [0, 0, 0, 16] as [number, number, number, number] });
    }

    // Accent rule
    if (branding.companyName || logoDataUri) {
      items.push({
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: SPACING.contentWidth, y2: 0, lineWidth: SPACING.coverAccentRuleHeight, lineColor: palette.accent }],
        margin: [0, 0, 0, 24] as [number, number, number, number],
      });
    }

    // Badge
    if (cover.badge) {
      items.push({ text: cover.badge.toUpperCase(), fontSize: TYPOGRAPHY.coverBadge, bold: true, color: palette.accent, characterSpacing: 2, margin: [0, branding.companyName ? 0 : 60, 0, 8] as [number, number, number, number] });
    }

    // Title
    items.push({
      text: cover.title,
      fontSize: TYPOGRAPHY.coverTitle, bold: true, color: palette.textPrimary, lineHeight: 1.15,
      margin: [0, cover.badge ? 0 : SPACING.coverTitleMarginTop, 0, 4] as [number, number, number, number],
    });

    // Subtitle
    if (cover.subtitle) {
      items.push({ text: cover.subtitle, fontSize: TYPOGRAPHY.coverSubtitle, color: palette.textCaption, lineHeight: 1.3, margin: [0, 0, 0, 20] as [number, number, number, number] });
    }

    // Client info table
    const kvPairs: Array<{ key: string; value: string }> = [];
    if (cover.recipientName) kvPairs.push({ key: 'Prepared For', value: cover.recipientName });
    if (cover.date) kvPairs.push({ key: 'Date', value: cover.date });
    if (cover.projectRef) kvPairs.push({ key: 'Reference', value: cover.projectRef });

    if (kvPairs.length > 0) {
      items.push({
        margin: [0, SPACING.coverClientInfoMarginTop, 0, 0] as [number, number, number, number],
        table: {
          widths: [110, '*'],
          body: kvPairs.map((p) => [
            { text: p.key, bold: true, fontSize: TYPOGRAPHY.label, color: palette.textCaption, margin: [0, 4, 8, 4] as [number, number, number, number] },
            { text: p.value, fontSize: TYPOGRAPHY.body, color: palette.textPrimary, margin: [0, 4, 0, 4] as [number, number, number, number] },
          ]),
        },
        layout: {
          hLineWidth: (i: number, node: { table: { body: unknown[][] } }) =>
            i === 0 ? 0 : i === node.table.body.length ? 0 : 0.3,
          vLineWidth: () => 0,
          hLineColor: () => palette.borderLight,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        },
      });
    }

    return { stack: items };
  }

  private renderBlock(block: DocumentBlock, palette: DocumentPalette): Content[] {
    switch (block.type) {
      case 'narrative':
        return block.paragraphs.map((p) => ({
          text: p, fontSize: TYPOGRAPHY.body, color: palette.textBody, lineHeight: 1.5,
          margin: [0, 0, 0, SPACING.paragraphGap] as [number, number, number, number],
        }));

      case 'heading': {
        const cfg: Record<number, { size: number; color: string; marginTop: number }> = {
          1: { size: TYPOGRAPHY.h1, color: palette.accent, marginTop: 16 },
          2: { size: TYPOGRAPHY.h2, color: palette.accent, marginTop: 14 },
          3: { size: TYPOGRAPHY.h3, color: palette.textPrimary, marginTop: 10 },
        };
        const c = cfg[block.level] ?? cfg[3];
        return [{ text: block.text, fontSize: c.size, bold: true, color: c.color, margin: [0, c.marginTop, 0, 6] as [number, number, number, number] }];
      }

      case 'table': {
        const headerRow: TableCell[] = block.columns.map((col) => ({
          text: col.header, bold: true, fontSize: TYPOGRAPHY.tableHeader, color: palette.textOnAccent,
          fillColor: palette.accent, alignment: col.align ?? 'left',
          margin: [SPACING.tableCellH, SPACING.tableCellV, SPACING.tableCellH, SPACING.tableCellV] as [number, number, number, number],
        }));
        const bodyRows: TableCell[][] = block.rows.map((row, i) =>
          row.map((cell, colIdx) => ({
            text: cell, fontSize: TYPOGRAPHY.tableBody, color: palette.textBody,
            fillColor: i % 2 === 0 ? palette.bgSubtle : palette.bgPage,
            alignment: block.columns[colIdx]?.align ?? 'left',
            margin: [SPACING.tableCellH, SPACING.tableCellV - 1, SPACING.tableCellH, SPACING.tableCellV - 1] as [number, number, number, number],
          }))
        );
        const result: Content[] = [{
          margin: [0, 4, 0, SPACING.blockGap] as [number, number, number, number],
          table: { headerRows: 1, widths: block.columns.map(() => '*'), body: [headerRow, ...bodyRows] },
          layout: {
            hLineWidth: (i: number, node: { table: { body: unknown[][] } }) => {
              if (i === 0) return 0;
              if (i === 1) return 0.75;
              if (i === node.table.body.length) return 0.75;
              return 0.5;
            },
            vLineWidth: () => 0,
            hLineColor: (i: number) => i === 1 ? palette.accent : palette.borderLight,
          },
        }];
        if (block.caption) {
          result.push({ text: block.caption, fontSize: TYPOGRAPHY.caption, italics: true, color: palette.textCaption, margin: [0, 2, 0, SPACING.blockGap] as [number, number, number, number] });
        }
        return result;
      }

      case 'checklist': {
        const items: Content[] = [];
        if (block.heading) {
          items.push({ text: block.heading, bold: true, fontSize: TYPOGRAPHY.checklistHeading, color: palette.textPrimary, margin: [0, 4, 0, 6] as [number, number, number, number] });
        }
        for (const item of block.items) {
          const checkbox = item.checked ? '\u2611' : '\u2610';
          const parts: Array<{ text: string; bold?: boolean; color?: string; fontSize?: number }> = [
            { text: `${checkbox}  `, color: item.checked ? palette.accent : palette.textMuted, fontSize: TYPOGRAPHY.checklistItem + 1 },
            { text: item.label, color: palette.textBody, fontSize: TYPOGRAPHY.checklistItem },
          ];
          if (item.detail) parts.push({ text: ` — ${item.detail}`, color: palette.textCaption, fontSize: TYPOGRAPHY.checklistItem });
          if (item.quantity) parts.push({ text: `  (${item.quantity})`, color: palette.textMuted, fontSize: TYPOGRAPHY.checklistItem });
          items.push({ text: parts, margin: [SPACING.checklistIndent, 3, 0, 3] as [number, number, number, number] });
        }
        items.push({ text: '', margin: [0, 0, 0, 4] as [number, number, number, number] });
        return items;
      }

      case 'steps': {
        const items: Content[] = [];
        if (block.heading) {
          items.push({ text: block.heading, bold: true, fontSize: TYPOGRAPHY.checklistHeading, color: palette.textPrimary, margin: [0, 4, 0, 6] as [number, number, number, number] });
        }
        block.items.forEach((step, i) => {
          const dur = step.duration ? `  (${step.duration})` : '';
          items.push({
            text: [
              { text: `${i + 1}`, bold: true, color: palette.accent, fontSize: TYPOGRAPHY.stepsTitle },
              { text: `  ${step.title}${dur}`, bold: true, color: palette.textPrimary, fontSize: TYPOGRAPHY.stepsTitle },
            ],
            margin: [0, 8, 0, 2] as [number, number, number, number],
          });
          items.push({ text: step.description, fontSize: TYPOGRAPHY.stepsDesc, color: palette.textBody, margin: [SPACING.stepsIndent, 0, 0, 2] as [number, number, number, number] });
          if (step.notes) {
            items.push({ text: step.notes, fontSize: TYPOGRAPHY.stepsNotes, italics: true, color: palette.textCaption, margin: [SPACING.stepsIndent, 0, 0, 4] as [number, number, number, number] });
          }
        });
        items.push({ text: '', margin: [0, 0, 0, 4] as [number, number, number, number] });
        return items;
      }

      case 'line_items': {
        const headerRow: TableCell[] = block.columns.map((col, idx) => ({
          text: col, bold: true, fontSize: TYPOGRAPHY.tableHeader, color: palette.textOnAccent,
          fillColor: palette.accent,
          alignment: idx >= block.columns.length - 2 ? 'right' : 'left',
          margin: [SPACING.tableCellH, SPACING.tableCellV, SPACING.tableCellH, SPACING.tableCellV] as [number, number, number, number],
        }));
        const bodyRows: TableCell[][] = block.rows.map((row, i) =>
          row.cells.map((cell, colIdx) => ({
            text: cell, bold: row.isBold ?? false, fontSize: TYPOGRAPHY.tableBody, color: palette.textBody,
            fillColor: i % 2 === 0 ? palette.bgSubtle : palette.bgPage,
            alignment: colIdx >= block.columns.length - 2 ? 'right' : 'left',
            margin: [SPACING.tableCellH, SPACING.tableCellV - 1, SPACING.tableCellH, SPACING.tableCellV - 1] as [number, number, number, number],
          }))
        );
        const lineItems: Content[] = [{
          margin: [0, 4, 0, 4] as [number, number, number, number],
          table: { headerRows: 1, widths: block.columns.map((_, idx) => idx === 0 ? '*' : 'auto'), body: [headerRow, ...bodyRows] },
          layout: {
            hLineWidth: (i: number, node: { table: { body: unknown[][] } }) => { if (i === 0) return 0; if (i === 1) return 0.75; if (i === node.table.body.length) return 0.75; return 0.5; },
            vLineWidth: () => 0,
            hLineColor: (i: number) => i === 1 ? palette.accent : palette.borderLight,
          },
        }];
        if (block.subtotal) lineItems.push({ text: `Subtotal: ${block.subtotal}`, alignment: 'right' as const, fontSize: TYPOGRAPHY.financialSubtotal, color: palette.textBody, margin: [0, 6, 0, 2] as [number, number, number, number] });
        if (block.taxAmount) lineItems.push({ text: `${block.taxLabel ?? 'Tax'}: ${block.taxAmount}`, alignment: 'right' as const, fontSize: TYPOGRAPHY.financialSubtotal, color: palette.textBody, margin: [0, 0, 0, 2] as [number, number, number, number] });
        if (block.totalAmount) {
          lineItems.push({ canvas: [{ type: 'line', x1: SPACING.contentWidth - 200, y1: 0, x2: SPACING.contentWidth, y2: 0, lineWidth: 0.75, lineColor: palette.borderMedium }], margin: [0, 4, 0, 4] as [number, number, number, number] });
          lineItems.push({ text: `${block.totalLabel ?? 'Total'}: ${block.totalAmount}`, alignment: 'right' as const, fontSize: 14, bold: true, color: palette.accent, margin: [0, 0, 0, SPACING.blockGap] as [number, number, number, number] });
        }
        return lineItems;
      }

      case 'key_value':
        return [{
          margin: [0, 4, 0, SPACING.blockGap] as [number, number, number, number],
          table: {
            widths: [130, '*'],
            body: block.pairs.map((p) => [
              { text: p.key, bold: true, fontSize: TYPOGRAPHY.label, color: palette.textCaption, margin: [0, 3, 8, 3] as [number, number, number, number] },
              { text: p.value, fontSize: TYPOGRAPHY.tableBody, color: palette.textPrimary, margin: [0, 3, 0, 3] as [number, number, number, number] },
            ]),
          },
          layout: {
            hLineWidth: (i: number, node: { table: { body: unknown[][] } }) => (i === 0 || i === node.table.body.length ? 0 : 0.3),
            vLineWidth: () => 0, hLineColor: () => palette.bgMuted, paddingLeft: () => 0, paddingRight: () => 0,
          },
        }];

      case 'image':
        return [
          { text: `[Image${block.caption ? ': ' + block.caption : ''}]`, fontSize: TYPOGRAPHY.label, italics: true, color: palette.textMuted, margin: [0, 4, 0, 4] as [number, number, number, number] },
          ...(block.caption ? [{ text: block.caption, fontSize: TYPOGRAPHY.caption, italics: true, color: palette.textCaption, margin: [0, 0, 0, SPACING.blockGap] as [number, number, number, number] }] : []),
        ];

      case 'divider':
        return [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: SPACING.contentWidth, y2: 0, lineWidth: 0.5, lineColor: palette.borderLight }], margin: [0, SPACING.dividerMarginY, 0, SPACING.dividerMarginY] as [number, number, number, number] }];

      case 'callout': {
        const colors = palette.callout[block.variant] ?? palette.callout.info;
        return [{
          margin: [0, 6, 0, 8] as [number, number, number, number],
          unbreakable: true,
          table: {
            widths: [SPACING.calloutBorderWidth, '*'],
            body: [[
              { text: '', fillColor: colors.border, border: [false, false, false, false] },
              { text: block.text, fontSize: TYPOGRAPHY.tableBody, color: palette.textBody, fillColor: colors.bg, margin: [SPACING.calloutPadding, SPACING.calloutPadding, SPACING.calloutPadding, SPACING.calloutPadding] as [number, number, number, number], border: [false, false, false, false] },
            ]],
          },
          layout: 'noBorders',
        }];
      }

      default:
        return [];
    }
  }
}
