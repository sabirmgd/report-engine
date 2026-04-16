"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfmakeRenderer = void 0;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfmakeModule = require('pdfmake/build/pdfmake');
const design_tokens_js_1 = require("./design-tokens.js");
const font_loader_js_1 = require("./fonts/font-loader.js");
const pdf_logo_fetcher_js_1 = require("./pdf-logo-fetcher.js");
function truncate(str, max) {
    return str.length <= max ? str : str.slice(0, max - 3) + '...';
}
class PdfmakeRenderer {
    async render(doc) {
        const { cover, branding, sections } = doc;
        const palette = (0, design_tokens_js_1.buildPalette)(branding.primaryColor, branding.secondaryColor);
        const logoDataUri = branding.logoUrl ? await (0, pdf_logo_fetcher_js_1.fetchLogoAsDataUri)(branding.logoUrl) : null;
        const companyName = branding.companyName ?? 'Report';
        const content = [];
        // Cover header — no forced page break, sections flow on same page
        content.push(this.renderCoverPage(doc, palette, logoDataUri));
        content.push({
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0, lineWidth: 0.5, lineColor: palette.borderLight }],
            margin: [0, 16, 0, 24],
        });
        // Sections
        for (const section of sections) {
            content.push({
                stack: [
                    {
                        text: section.title,
                        fontSize: design_tokens_js_1.TYPOGRAPHY.sectionTitle,
                        bold: true,
                        color: palette.accent,
                        margin: [0, design_tokens_js_1.SPACING.sectionGapBefore, 0, 4],
                    },
                    {
                        canvas: [{
                                type: 'line', x1: 0, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0,
                                lineWidth: 0.5, lineColor: palette.borderLight,
                            }],
                        margin: [0, 0, 0, design_tokens_js_1.SPACING.sectionGapAfter],
                    },
                ],
            });
            for (const block of section.blocks) {
                content.push(...this.renderBlock(block, palette));
            }
        }
        const styles = (0, design_tokens_js_1.buildPdfStyles)(palette);
        const docTitle = cover.title;
        const docDefinition = {
            content,
            styles,
            defaultStyle: {
                font: 'Inter',
                fontSize: design_tokens_js_1.TYPOGRAPHY.body,
                lineHeight: 1.5,
                color: palette.textBody,
            },
            pageSize: 'LETTER',
            pageMargins: design_tokens_js_1.SPACING.pageMargins,
            info: {
                title: docTitle,
                author: companyName,
                subject: cover.subtitle ?? '',
            },
            header: (currentPage) => {
                if (currentPage <= 1)
                    return null;
                return logoDataUri
                    ? {
                        columns: [
                            { image: logoDataUri, width: 16, margin: [0, 2, 6, 0] },
                            { text: companyName, fontSize: 8, color: palette.textMuted, margin: [0, 4, 0, 0] },
                        ],
                        columnGap: 0,
                        margin: [design_tokens_js_1.SPACING.pageMargins[0], 20, design_tokens_js_1.SPACING.pageMargins[2], 0],
                    }
                    : {
                        text: companyName,
                        fontSize: 8,
                        color: palette.textMuted,
                        margin: [design_tokens_js_1.SPACING.pageMargins[0], 24, design_tokens_js_1.SPACING.pageMargins[2], 0],
                    };
            },
            footer: (currentPage, pageCount) => ({
                stack: [
                    {
                        canvas: [{
                                type: 'line', x1: 0, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0,
                                lineWidth: 0.3, lineColor: palette.borderLight,
                            }],
                        margin: [design_tokens_js_1.SPACING.pageMargins[0], 0, 0, design_tokens_js_1.SPACING.footerRuleMarginBottom],
                    },
                    {
                        columns: [
                            {
                                text: `${truncate(docTitle, 40)}  |  ${companyName}`,
                                fontSize: design_tokens_js_1.TYPOGRAPHY.footer, color: palette.textMuted, alignment: 'left',
                                margin: [design_tokens_js_1.SPACING.pageMargins[0], 0, 0, 0],
                            },
                            {
                                text: `Page ${currentPage} of ${pageCount}`,
                                fontSize: design_tokens_js_1.TYPOGRAPHY.footer, color: palette.textMuted, alignment: 'right',
                                margin: [0, 0, design_tokens_js_1.SPACING.pageMargins[2], 0],
                            },
                        ],
                    },
                ],
            }),
        };
        const vfs = (0, font_loader_js_1.loadFontVfs)();
        for (const [filename, buf] of Object.entries(vfs)) {
            pdfmakeModule.virtualfs.storage[filename] = buf;
        }
        pdfmakeModule.fonts = font_loader_js_1.INTER_FONTS;
        const pdfDoc = pdfmakeModule.createPdf(docDefinition);
        return Buffer.from(await pdfDoc.getBuffer());
    }
    renderCoverPage(doc, palette, logoDataUri) {
        const { cover, branding } = doc;
        const items = [];
        // Left accent strip
        items.push({
            canvas: [{ type: 'rect', x: -design_tokens_js_1.SPACING.pageMargins[0], y: -design_tokens_js_1.SPACING.pageMargins[1], w: 4, h: 900, color: palette.accent }],
            absolutePosition: { x: 0, y: 0 },
        });
        // Logo
        if (logoDataUri) {
            items.push({ image: logoDataUri, fit: [160, design_tokens_js_1.SPACING.coverLogoMaxHeight], margin: [0, 0, 0, 12] });
        }
        // Company name
        if (branding.companyName) {
            items.push({
                text: branding.companyName,
                fontSize: design_tokens_js_1.TYPOGRAPHY.coverCompanyName, bold: true, color: palette.accent,
                margin: [0, logoDataUri ? 0 : 20, 0, 2],
            });
        }
        // Tagline
        if (branding.tagline) {
            items.push({ text: branding.tagline, fontSize: design_tokens_js_1.TYPOGRAPHY.coverTagline, color: palette.textCaption, margin: [0, 0, 0, 4] });
        }
        // Contact line
        const contactParts = [branding.phone, branding.email, branding.website].filter(Boolean);
        if (contactParts.length > 0) {
            items.push({ text: contactParts.join('   |   '), fontSize: design_tokens_js_1.TYPOGRAPHY.coverContact, color: palette.textMuted, margin: [0, 0, 0, 16] });
        }
        // Accent rule
        if (branding.companyName || logoDataUri) {
            items.push({
                canvas: [{ type: 'line', x1: 0, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0, lineWidth: design_tokens_js_1.SPACING.coverAccentRuleHeight, lineColor: palette.accent }],
                margin: [0, 0, 0, 24],
            });
        }
        // Badge
        if (cover.badge) {
            items.push({ text: cover.badge.toUpperCase(), fontSize: design_tokens_js_1.TYPOGRAPHY.coverBadge, bold: true, color: palette.accent, characterSpacing: 2, margin: [0, branding.companyName ? 0 : 60, 0, 8] });
        }
        // Title
        items.push({
            text: cover.title,
            fontSize: design_tokens_js_1.TYPOGRAPHY.coverTitle, bold: true, color: palette.textPrimary, lineHeight: 1.15,
            margin: [0, cover.badge ? 0 : design_tokens_js_1.SPACING.coverTitleMarginTop, 0, 4],
        });
        // Subtitle
        if (cover.subtitle) {
            items.push({ text: cover.subtitle, fontSize: design_tokens_js_1.TYPOGRAPHY.coverSubtitle, color: palette.textCaption, lineHeight: 1.3, margin: [0, 0, 0, 20] });
        }
        // Client info table
        const kvPairs = [];
        if (cover.recipientName)
            kvPairs.push({ key: 'Prepared For', value: cover.recipientName });
        if (cover.date)
            kvPairs.push({ key: 'Date', value: cover.date });
        if (cover.projectRef)
            kvPairs.push({ key: 'Reference', value: cover.projectRef });
        if (kvPairs.length > 0) {
            items.push({
                margin: [0, design_tokens_js_1.SPACING.coverClientInfoMarginTop, 0, 0],
                table: {
                    widths: [110, '*'],
                    body: kvPairs.map((p) => [
                        { text: p.key, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.label, color: palette.textCaption, margin: [0, 4, 8, 4] },
                        { text: p.value, fontSize: design_tokens_js_1.TYPOGRAPHY.body, color: palette.textPrimary, margin: [0, 4, 0, 4] },
                    ]),
                },
                layout: {
                    hLineWidth: (i, node) => i === 0 ? 0 : i === node.table.body.length ? 0 : 0.3,
                    vLineWidth: () => 0,
                    hLineColor: () => palette.borderLight,
                    paddingLeft: () => 0,
                    paddingRight: () => 0,
                },
            });
        }
        return { stack: items };
    }
    renderBlock(block, palette) {
        switch (block.type) {
            case 'narrative':
                return block.paragraphs.map((p) => ({
                    text: p, fontSize: design_tokens_js_1.TYPOGRAPHY.body, color: palette.textBody, lineHeight: 1.5,
                    margin: [0, 0, 0, design_tokens_js_1.SPACING.paragraphGap],
                }));
            case 'heading': {
                const cfg = {
                    1: { size: design_tokens_js_1.TYPOGRAPHY.h1, color: palette.accent, marginTop: 16 },
                    2: { size: design_tokens_js_1.TYPOGRAPHY.h2, color: palette.accent, marginTop: 14 },
                    3: { size: design_tokens_js_1.TYPOGRAPHY.h3, color: palette.textPrimary, marginTop: 10 },
                };
                const c = cfg[block.level] ?? cfg[3];
                return [{ text: block.text, fontSize: c.size, bold: true, color: c.color, margin: [0, c.marginTop, 0, 6] }];
            }
            case 'table': {
                const headerRow = block.columns.map((col) => ({
                    text: col.header, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.tableHeader, color: palette.textOnAccent,
                    fillColor: palette.accent, alignment: col.align ?? 'left',
                    margin: [design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV, design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV],
                }));
                const bodyRows = block.rows.map((row, i) => row.map((cell, colIdx) => ({
                    text: cell, fontSize: design_tokens_js_1.TYPOGRAPHY.tableBody, color: palette.textBody,
                    fillColor: i % 2 === 0 ? palette.bgSubtle : palette.bgPage,
                    alignment: block.columns[colIdx]?.align ?? 'left',
                    margin: [design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV - 1, design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV - 1],
                })));
                const result = [{
                        margin: [0, 4, 0, design_tokens_js_1.SPACING.blockGap],
                        table: { headerRows: 1, widths: block.columns.map(() => '*'), body: [headerRow, ...bodyRows] },
                        layout: {
                            hLineWidth: (i, node) => {
                                if (i === 0)
                                    return 0;
                                if (i === 1)
                                    return 0.75;
                                if (i === node.table.body.length)
                                    return 0.75;
                                return 0.5;
                            },
                            vLineWidth: () => 0,
                            hLineColor: (i) => i === 1 ? palette.accent : palette.borderLight,
                        },
                    }];
                if (block.caption) {
                    result.push({ text: block.caption, fontSize: design_tokens_js_1.TYPOGRAPHY.caption, italics: true, color: palette.textCaption, margin: [0, 2, 0, design_tokens_js_1.SPACING.blockGap] });
                }
                return result;
            }
            case 'checklist': {
                const items = [];
                if (block.heading) {
                    items.push({ text: block.heading, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistHeading, color: palette.textPrimary, margin: [0, 4, 0, 6] });
                }
                for (const item of block.items) {
                    const checkbox = item.checked ? '\u2611' : '\u2610';
                    const parts = [
                        { text: `${checkbox}  `, color: item.checked ? palette.accent : palette.textMuted, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistItem + 1 },
                        { text: item.label, color: palette.textBody, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistItem },
                    ];
                    if (item.detail)
                        parts.push({ text: ` — ${item.detail}`, color: palette.textCaption, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistItem });
                    if (item.quantity)
                        parts.push({ text: `  (${item.quantity})`, color: palette.textMuted, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistItem });
                    items.push({ text: parts, margin: [design_tokens_js_1.SPACING.checklistIndent, 3, 0, 3] });
                }
                items.push({ text: '', margin: [0, 0, 0, 4] });
                return items;
            }
            case 'steps': {
                const items = [];
                if (block.heading) {
                    items.push({ text: block.heading, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.checklistHeading, color: palette.textPrimary, margin: [0, 4, 0, 6] });
                }
                block.items.forEach((step, i) => {
                    const dur = step.duration ? `  (${step.duration})` : '';
                    items.push({
                        text: [
                            { text: `${i + 1}`, bold: true, color: palette.accent, fontSize: design_tokens_js_1.TYPOGRAPHY.stepsTitle },
                            { text: `  ${step.title}${dur}`, bold: true, color: palette.textPrimary, fontSize: design_tokens_js_1.TYPOGRAPHY.stepsTitle },
                        ],
                        margin: [0, 8, 0, 2],
                    });
                    items.push({ text: step.description, fontSize: design_tokens_js_1.TYPOGRAPHY.stepsDesc, color: palette.textBody, margin: [design_tokens_js_1.SPACING.stepsIndent, 0, 0, 2] });
                    if (step.notes) {
                        items.push({ text: step.notes, fontSize: design_tokens_js_1.TYPOGRAPHY.stepsNotes, italics: true, color: palette.textCaption, margin: [design_tokens_js_1.SPACING.stepsIndent, 0, 0, 4] });
                    }
                });
                items.push({ text: '', margin: [0, 0, 0, 4] });
                return items;
            }
            case 'line_items': {
                const headerRow = block.columns.map((col, idx) => ({
                    text: col, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.tableHeader, color: palette.textOnAccent,
                    fillColor: palette.accent,
                    alignment: idx >= block.columns.length - 2 ? 'right' : 'left',
                    margin: [design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV, design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV],
                }));
                const bodyRows = block.rows.map((row, i) => row.cells.map((cell, colIdx) => ({
                    text: cell, bold: row.isBold ?? false, fontSize: design_tokens_js_1.TYPOGRAPHY.tableBody, color: palette.textBody,
                    fillColor: i % 2 === 0 ? palette.bgSubtle : palette.bgPage,
                    alignment: colIdx >= block.columns.length - 2 ? 'right' : 'left',
                    margin: [design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV - 1, design_tokens_js_1.SPACING.tableCellH, design_tokens_js_1.SPACING.tableCellV - 1],
                })));
                const lineItems = [{
                        margin: [0, 4, 0, 4],
                        table: { headerRows: 1, widths: block.columns.map((_, idx) => idx === 0 ? '*' : 'auto'), body: [headerRow, ...bodyRows] },
                        layout: {
                            hLineWidth: (i, node) => { if (i === 0)
                                return 0; if (i === 1)
                                return 0.75; if (i === node.table.body.length)
                                return 0.75; return 0.5; },
                            vLineWidth: () => 0,
                            hLineColor: (i) => i === 1 ? palette.accent : palette.borderLight,
                        },
                    }];
                if (block.subtotal)
                    lineItems.push({ text: `Subtotal: ${block.subtotal}`, alignment: 'right', fontSize: design_tokens_js_1.TYPOGRAPHY.financialSubtotal, color: palette.textBody, margin: [0, 6, 0, 2] });
                if (block.taxAmount)
                    lineItems.push({ text: `${block.taxLabel ?? 'Tax'}: ${block.taxAmount}`, alignment: 'right', fontSize: design_tokens_js_1.TYPOGRAPHY.financialSubtotal, color: palette.textBody, margin: [0, 0, 0, 2] });
                if (block.totalAmount) {
                    lineItems.push({ canvas: [{ type: 'line', x1: design_tokens_js_1.SPACING.contentWidth - 200, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0, lineWidth: 0.75, lineColor: palette.borderMedium }], margin: [0, 4, 0, 4] });
                    lineItems.push({ text: `${block.totalLabel ?? 'Total'}: ${block.totalAmount}`, alignment: 'right', fontSize: 14, bold: true, color: palette.accent, margin: [0, 0, 0, design_tokens_js_1.SPACING.blockGap] });
                }
                return lineItems;
            }
            case 'key_value':
                return [{
                        margin: [0, 4, 0, design_tokens_js_1.SPACING.blockGap],
                        table: {
                            widths: [130, '*'],
                            body: block.pairs.map((p) => [
                                { text: p.key, bold: true, fontSize: design_tokens_js_1.TYPOGRAPHY.label, color: palette.textCaption, margin: [0, 3, 8, 3] },
                                { text: p.value, fontSize: design_tokens_js_1.TYPOGRAPHY.tableBody, color: palette.textPrimary, margin: [0, 3, 0, 3] },
                            ]),
                        },
                        layout: {
                            hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.3),
                            vLineWidth: () => 0, hLineColor: () => palette.bgMuted, paddingLeft: () => 0, paddingRight: () => 0,
                        },
                    }];
            case 'image':
                return [
                    { text: `[Image${block.caption ? ': ' + block.caption : ''}]`, fontSize: design_tokens_js_1.TYPOGRAPHY.label, italics: true, color: palette.textMuted, margin: [0, 4, 0, 4] },
                    ...(block.caption ? [{ text: block.caption, fontSize: design_tokens_js_1.TYPOGRAPHY.caption, italics: true, color: palette.textCaption, margin: [0, 0, 0, design_tokens_js_1.SPACING.blockGap] }] : []),
                ];
            case 'divider':
                return [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: design_tokens_js_1.SPACING.contentWidth, y2: 0, lineWidth: 0.5, lineColor: palette.borderLight }], margin: [0, design_tokens_js_1.SPACING.dividerMarginY, 0, design_tokens_js_1.SPACING.dividerMarginY] }];
            case 'callout': {
                const colors = palette.callout[block.variant] ?? palette.callout.info;
                return [{
                        margin: [0, 6, 0, 8],
                        unbreakable: true,
                        table: {
                            widths: [design_tokens_js_1.SPACING.calloutBorderWidth, '*'],
                            body: [[
                                    { text: '', fillColor: colors.border, border: [false, false, false, false] },
                                    { text: block.text, fontSize: design_tokens_js_1.TYPOGRAPHY.tableBody, color: palette.textBody, fillColor: colors.bg, margin: [design_tokens_js_1.SPACING.calloutPadding, design_tokens_js_1.SPACING.calloutPadding, design_tokens_js_1.SPACING.calloutPadding, design_tokens_js_1.SPACING.calloutPadding], border: [false, false, false, false] },
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
exports.PdfmakeRenderer = PdfmakeRenderer;
//# sourceMappingURL=renderer.js.map