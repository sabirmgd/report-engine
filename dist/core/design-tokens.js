"use strict";
/**
 * Centralized design tokens for PDF document rendering.
 * Brand colors come from BrandingConfig; everything else is fixed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPACING = exports.TYPOGRAPHY = void 0;
exports.hexToHsl = hexToHsl;
exports.hslToHex = hslToHex;
exports.buildPalette = buildPalette;
exports.buildPdfStyles = buildPdfStyles;
exports.formatCurrency = formatCurrency;
function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min)
        return { h: 0, s: 0, l: l * 100 };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r)
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g)
        h = ((b - r) / d + 2) / 6;
    else
        h = ((r - g) / d + 4) / 6;
    return { h: h * 360, s: s * 100, l: l * 100 };
}
function hslToHex(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;
    if (s === 0) {
        const v = Math.round(l * 255);
        return `#${v.toString(16).padStart(2, '0').repeat(3)}`;
    }
    const hue2rgb = (p, q, t) => {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '00')}${b.toString(16).padStart(2, '0')}`;
}
function buildPalette(primaryColor, secondaryColor) {
    const primary = hexToHsl(primaryColor);
    const secondary = secondaryColor ?? hslToHex({ h: primary.h, s: primary.s, l: Math.max(primary.l - 15, 20) });
    return {
        accent: primaryColor,
        accentDark: secondary,
        accentLight: hslToHex({ h: primary.h, s: Math.min(primary.s, 30), l: 92 }),
        accentMuted: hslToHex({ h: primary.h, s: Math.max(primary.s - 40, 10), l: 65 }),
        textPrimary: '#1f2937',
        textBody: '#374151',
        textCaption: '#64748b',
        textMuted: '#94a3b8',
        textOnAccent: '#ffffff',
        borderLight: '#e5e7eb',
        borderMedium: '#d1d5db',
        bgPage: '#ffffff',
        bgSubtle: '#f8fafc',
        bgMuted: '#f1f5f9',
        callout: {
            info: { bg: '#eff6ff', border: '#2563eb' },
            warning: { bg: '#fffbeb', border: '#d97706' },
            success: { bg: '#ecfdf5', border: '#059669' },
            danger: { bg: '#fef2f2', border: '#dc2626' },
        },
    };
}
exports.TYPOGRAPHY = {
    coverTitle: 28, coverSubtitle: 14, coverBadge: 9,
    coverCompanyName: 20, coverTagline: 9, coverContact: 8,
    sectionTitle: 16, h1: 18, h2: 14, h3: 12,
    body: 10, label: 9, caption: 8, footer: 7,
    tableHeader: 9, tableBody: 9,
    financialTotal: 16, financialSubtotal: 10,
    checklistHeading: 11, checklistItem: 9,
    stepsTitle: 10, stepsDesc: 9, stepsNotes: 8,
};
exports.SPACING = {
    pageMargins: [60, 72, 60, 56],
    contentWidth: 492,
    sectionGapBefore: 24, sectionGapAfter: 12,
    paragraphGap: 8, blockGap: 8,
    tableCellH: 8, tableCellV: 6,
    coverLogoMaxHeight: 50, coverAccentRuleHeight: 2,
    coverTitleMarginTop: 16, coverClientInfoMarginTop: 20,
    calloutPadding: 10, calloutBorderWidth: 4,
    checklistIndent: 14, stepsIndent: 18,
    dividerMarginY: 10, footerRuleMarginBottom: 4,
    headerLogoHeight: 20,
};
function buildPdfStyles(palette) {
    return {
        h1: { fontSize: exports.TYPOGRAPHY.h1, bold: true, color: palette.accent, lineHeight: 1.2 },
        h2: { fontSize: exports.TYPOGRAPHY.h2, bold: true, color: palette.accent, lineHeight: 1.25 },
        h3: { fontSize: exports.TYPOGRAPHY.h3, bold: true, color: palette.textPrimary, lineHeight: 1.3 },
        body: { fontSize: exports.TYPOGRAPHY.body, color: palette.textBody, lineHeight: 1.5 },
        caption: { fontSize: exports.TYPOGRAPHY.caption, color: palette.textCaption, italics: true, lineHeight: 1.4 },
        label: { fontSize: exports.TYPOGRAPHY.label, bold: true, color: palette.textCaption },
        tableHeader: { fontSize: exports.TYPOGRAPHY.tableHeader, bold: true, color: palette.textOnAccent },
        tableBody: { fontSize: exports.TYPOGRAPHY.tableBody, color: palette.textBody },
        financial: { fontSize: exports.TYPOGRAPHY.financialTotal, bold: true, color: palette.accent },
    };
}
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency,
        minimumFractionDigits: 2, maximumFractionDigits: 2,
    }).format(amount);
}
//# sourceMappingURL=design-tokens.js.map