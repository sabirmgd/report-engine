"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullRequirementsStrategy = void 0;
class FullRequirementsStrategy {
    async collect(missing, callbacks = {}) {
        if (!callbacks.onPresentAll)
            throw new Error('FullRequirementsStrategy requires onPresentAll callback');
        return callbacks.onPresentAll(missing);
    }
}
exports.FullRequirementsStrategy = FullRequirementsStrategy;
//# sourceMappingURL=full-requirements.strategy.js.map