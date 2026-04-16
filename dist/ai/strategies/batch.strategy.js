"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchStrategy = void 0;
const types_js_1 = require("./types.js");
class BatchStrategy {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async collect(missing, _callbacks) {
        if (missing.length > 0)
            throw new types_js_1.InsufficientDataError(missing);
        return {};
    }
}
exports.BatchStrategy = BatchStrategy;
//# sourceMappingURL=batch.strategy.js.map