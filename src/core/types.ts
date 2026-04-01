/**
 * Block-type discriminated union for schema-driven document generation.
 * Each block maps to a specific renderer in pdfmake.
 */

export interface NarrativeBlock {
  type: 'narrative';
  paragraphs: string[];
}

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

export interface TableBlock {
  type: 'table';
  columns: Array<{
    header: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
  }>;
  rows: string[][];
  caption?: string;
}

export interface ChecklistBlock {
  type: 'checklist';
  heading?: string;
  items: Array<{
    label: string;
    detail?: string;
    quantity?: string;
    checked: boolean;
  }>;
}

export interface StepsBlock {
  type: 'steps';
  heading?: string;
  items: Array<{
    title: string;
    description: string;
    duration?: string;
    notes?: string;
  }>;
}

export interface LineItemsBlock {
  type: 'line_items';
  columns: string[];
  rows: Array<{
    cells: string[];
    isBold?: boolean;
  }>;
  subtotal?: string;
  taxLabel?: string;
  taxAmount?: string;
  totalLabel?: string;
  totalAmount?: string;
}

export interface KeyValueBlock {
  type: 'key_value';
  pairs: Array<{ key: string; value: string }>;
}

export interface ImageBlock {
  type: 'image';
  src: string; // base64 data URI or URL (URLs will show as placeholder)
  caption?: string;
  width?: number;
}

export interface DividerBlock {
  type: 'divider';
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'success' | 'danger';
  text: string;
}

export type DocumentBlock =
  | NarrativeBlock
  | HeadingBlock
  | TableBlock
  | ChecklistBlock
  | StepsBlock
  | LineItemsBlock
  | KeyValueBlock
  | ImageBlock
  | DividerBlock
  | CalloutBlock;

export type DocumentBlockType = DocumentBlock['type'];

export interface ReportSection {
  title: string;
  blocks: DocumentBlock[];
}

export interface BrandingConfig {
  primaryColor: string;       // e.g. '#6366f1'
  secondaryColor?: string;    // derived from primary if absent
  companyName?: string;
  tagline?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface CoverPageConfig {
  title: string;
  subtitle?: string;
  recipientName?: string;
  date?: string;
  badge?: string;
  projectRef?: string;
}

export interface ReportDocument {
  cover: CoverPageConfig;
  branding: BrandingConfig;
  sections: ReportSection[];
}
