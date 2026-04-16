"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsufficientDataError = void 0;
class InsufficientDataError extends Error {
    missingFields;
    constructor(missingFields) {
        super(`Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`);
        this.missingFields = missingFields;
        this.name = 'InsufficientDataError';
    }
}
exports.InsufficientDataError = InsufficientDataError;
//# sourceMappingURL=types.js.map