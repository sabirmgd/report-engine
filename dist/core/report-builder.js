"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportBuilder = void 0;
class ReportBuilder {
    _cover = { title: 'Report' };
    _branding;
    _sections = [];
    _currentSection = null;
    constructor(branding) {
        this._branding = branding;
    }
    // ── Cover page ──
    title(title) {
        this._cover.title = title;
        return this;
    }
    subtitle(subtitle) {
        this._cover.subtitle = subtitle;
        return this;
    }
    badge(badge) {
        this._cover.badge = badge;
        return this;
    }
    recipientName(name) {
        this._cover.recipientName = name;
        return this;
    }
    date(date) {
        this._cover.date = date;
        return this;
    }
    projectRef(ref) {
        this._cover.projectRef = ref;
        return this;
    }
    // ── Sections ──
    section(title) {
        this._flushSection();
        this._currentSection = { title, blocks: [] };
        return this;
    }
    // ── Blocks (must call section() first) ──
    narrative(paragraphs) {
        return this._addBlock({ type: 'narrative', paragraphs });
    }
    heading(level, text) {
        return this._addBlock({ type: 'heading', level, text });
    }
    table(columns, rows, caption) {
        return this._addBlock({ type: 'table', columns, rows, ...(caption ? { caption } : {}) });
    }
    checklist(items, heading) {
        return this._addBlock({ type: 'checklist', items, ...(heading ? { heading } : {}) });
    }
    steps(items, heading) {
        return this._addBlock({ type: 'steps', items, ...(heading ? { heading } : {}) });
    }
    lineItems(columns, rows, options) {
        return this._addBlock({ type: 'line_items', columns, rows, ...options });
    }
    keyValue(pairs) {
        return this._addBlock({ type: 'key_value', pairs });
    }
    callout(variant, text) {
        return this._addBlock({ type: 'callout', variant, text });
    }
    divider() {
        return this._addBlock({ type: 'divider' });
    }
    // ── Build ──
    build() {
        this._flushSection();
        return {
            cover: this._cover,
            branding: this._branding,
            sections: this._sections,
        };
    }
    _addBlock(block) {
        if (!this._currentSection) {
            this._currentSection = { title: 'Report', blocks: [] };
        }
        this._currentSection.blocks.push(block);
        return this;
    }
    _flushSection() {
        if (this._currentSection) {
            this._sections.push(this._currentSection);
            this._currentSection = null;
        }
    }
}
exports.ReportBuilder = ReportBuilder;
//# sourceMappingURL=report-builder.js.map