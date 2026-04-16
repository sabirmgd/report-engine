"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRegistry = void 0;
// ── Registry ──
class ReportRegistry {
    defs = new Map();
    register(def) {
        this.defs.set(def.id, def);
        return this;
    }
    get(id) {
        return this.defs.get(id);
    }
    list() {
        return [...this.defs.values()];
    }
    has(id) {
        return this.defs.has(id);
    }
}
exports.ReportRegistry = ReportRegistry;
//# sourceMappingURL=registry.js.map