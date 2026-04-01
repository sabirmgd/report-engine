import type { ReportDocument, ReportSection, DocumentBlock, BrandingConfig, CoverPageConfig, NarrativeBlock, HeadingBlock, TableBlock, ChecklistBlock, StepsBlock, LineItemsBlock, KeyValueBlock, CalloutBlock, DividerBlock } from './types.js';

export class ReportBuilder {
  private _cover: CoverPageConfig = { title: 'Report' };
  private _branding: BrandingConfig;
  private _sections: ReportSection[] = [];
  private _currentSection: ReportSection | null = null;

  constructor(branding: BrandingConfig) {
    this._branding = branding;
  }

  // ── Cover page ──

  title(title: string): this {
    this._cover.title = title;
    return this;
  }

  subtitle(subtitle: string): this {
    this._cover.subtitle = subtitle;
    return this;
  }

  badge(badge: string): this {
    this._cover.badge = badge;
    return this;
  }

  recipientName(name: string): this {
    this._cover.recipientName = name;
    return this;
  }

  date(date: string): this {
    this._cover.date = date;
    return this;
  }

  projectRef(ref: string): this {
    this._cover.projectRef = ref;
    return this;
  }

  // ── Sections ──

  section(title: string): this {
    this._flushSection();
    this._currentSection = { title, blocks: [] };
    return this;
  }

  // ── Blocks (must call section() first) ──

  narrative(paragraphs: string[]): this {
    return this._addBlock({ type: 'narrative', paragraphs } satisfies NarrativeBlock);
  }

  heading(level: 1 | 2 | 3, text: string): this {
    return this._addBlock({ type: 'heading', level, text } satisfies HeadingBlock);
  }

  table(
    columns: Array<{ header: string; align?: 'left' | 'center' | 'right'; width?: string }>,
    rows: string[][],
    caption?: string,
  ): this {
    return this._addBlock({ type: 'table', columns, rows, ...(caption ? { caption } : {}) } satisfies TableBlock);
  }

  checklist(
    items: Array<{ label: string; detail?: string; quantity?: string; checked: boolean }>,
    heading?: string,
  ): this {
    return this._addBlock({ type: 'checklist', items, ...(heading ? { heading } : {}) } satisfies ChecklistBlock);
  }

  steps(
    items: Array<{ title: string; description: string; duration?: string; notes?: string }>,
    heading?: string,
  ): this {
    return this._addBlock({ type: 'steps', items, ...(heading ? { heading } : {}) } satisfies StepsBlock);
  }

  lineItems(
    columns: string[],
    rows: Array<{ cells: string[]; isBold?: boolean }>,
    options?: { subtotal?: string; taxLabel?: string; taxAmount?: string; totalLabel?: string; totalAmount?: string },
  ): this {
    return this._addBlock({ type: 'line_items', columns, rows, ...options } satisfies LineItemsBlock);
  }

  keyValue(pairs: Array<{ key: string; value: string }>): this {
    return this._addBlock({ type: 'key_value', pairs } satisfies KeyValueBlock);
  }

  callout(variant: 'info' | 'warning' | 'success' | 'danger', text: string): this {
    return this._addBlock({ type: 'callout', variant, text } satisfies CalloutBlock);
  }

  divider(): this {
    return this._addBlock({ type: 'divider' } satisfies DividerBlock);
  }

  // ── Build ──

  build(): ReportDocument {
    this._flushSection();
    return {
      cover: this._cover,
      branding: this._branding,
      sections: this._sections,
    };
  }

  private _addBlock(block: DocumentBlock): this {
    if (!this._currentSection) {
      this._currentSection = { title: 'Report', blocks: [] };
    }
    this._currentSection.blocks.push(block);
    return this;
  }

  private _flushSection(): void {
    if (this._currentSection) {
      this._sections.push(this._currentSection);
      this._currentSection = null;
    }
  }
}
