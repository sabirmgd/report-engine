/**
 * Centralized design tokens for PDF document rendering.
 * Brand colors come from BrandingConfig; everything else is fixed.
 */
interface HSL {
    h: number;
    s: number;
    l: number;
}
export declare function hexToHsl(hex: string): HSL;
export declare function hslToHex(hsl: HSL): string;
export interface DocumentPalette {
    accent: string;
    accentDark: string;
    accentLight: string;
    accentMuted: string;
    textPrimary: string;
    textBody: string;
    textCaption: string;
    textMuted: string;
    textOnAccent: string;
    borderLight: string;
    borderMedium: string;
    bgPage: string;
    bgSubtle: string;
    bgMuted: string;
    callout: {
        info: {
            bg: string;
            border: string;
        };
        warning: {
            bg: string;
            border: string;
        };
        success: {
            bg: string;
            border: string;
        };
        danger: {
            bg: string;
            border: string;
        };
    };
}
export declare function buildPalette(primaryColor: string, secondaryColor?: string): DocumentPalette;
export declare const TYPOGRAPHY: {
    readonly coverTitle: 28;
    readonly coverSubtitle: 14;
    readonly coverBadge: 9;
    readonly coverCompanyName: 20;
    readonly coverTagline: 9;
    readonly coverContact: 8;
    readonly sectionTitle: 16;
    readonly h1: 18;
    readonly h2: 14;
    readonly h3: 12;
    readonly body: 10;
    readonly label: 9;
    readonly caption: 8;
    readonly footer: 7;
    readonly tableHeader: 9;
    readonly tableBody: 9;
    readonly financialTotal: 16;
    readonly financialSubtotal: 10;
    readonly checklistHeading: 11;
    readonly checklistItem: 9;
    readonly stepsTitle: 10;
    readonly stepsDesc: 9;
    readonly stepsNotes: 8;
};
export declare const SPACING: {
    readonly pageMargins: [number, number, number, number];
    readonly contentWidth: 492;
    readonly sectionGapBefore: 24;
    readonly sectionGapAfter: 12;
    readonly paragraphGap: 8;
    readonly blockGap: 8;
    readonly tableCellH: 8;
    readonly tableCellV: 6;
    readonly coverLogoMaxHeight: 50;
    readonly coverAccentRuleHeight: 2;
    readonly coverTitleMarginTop: 16;
    readonly coverClientInfoMarginTop: 20;
    readonly calloutPadding: 10;
    readonly calloutBorderWidth: 4;
    readonly checklistIndent: 14;
    readonly stepsIndent: 18;
    readonly dividerMarginY: 10;
    readonly footerRuleMarginBottom: 4;
    readonly headerLogoHeight: 20;
};
export declare function buildPdfStyles(palette: DocumentPalette): {
    h1: {
        fontSize: 18;
        bold: boolean;
        color: string;
        lineHeight: number;
    };
    h2: {
        fontSize: 14;
        bold: boolean;
        color: string;
        lineHeight: number;
    };
    h3: {
        fontSize: 12;
        bold: boolean;
        color: string;
        lineHeight: number;
    };
    body: {
        fontSize: 10;
        color: string;
        lineHeight: number;
    };
    caption: {
        fontSize: 8;
        color: string;
        italics: boolean;
        lineHeight: number;
    };
    label: {
        fontSize: 9;
        bold: boolean;
        color: string;
    };
    tableHeader: {
        fontSize: 9;
        bold: boolean;
        color: string;
    };
    tableBody: {
        fontSize: 9;
        color: string;
    };
    financial: {
        fontSize: 16;
        bold: boolean;
        color: string;
    };
};
export declare function formatCurrency(amount: number, currency?: string): string;
export {};
//# sourceMappingURL=design-tokens.d.ts.map