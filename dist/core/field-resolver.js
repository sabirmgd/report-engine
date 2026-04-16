"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldResolver = void 0;
class FieldResolver {
    resolve(fields, context, preProvided = {}) {
        const resolved = {};
        const missing = [];
        for (const field of fields) {
            const fromContext = field.autoResolve?.(context);
            const fromCaller = preProvided[field.key];
            const fromDefault = field.defaultValue;
            const value = fromContext ?? fromCaller ?? fromDefault;
            if (value !== undefined && value !== null) {
                resolved[field.key] = value;
            }
            else if (field.required) {
                missing.push(field);
            }
            else {
                // optional field with no value — use undefined (omit from resolved)
            }
        }
        return { resolved, missing };
    }
}
exports.FieldResolver = FieldResolver;
//# sourceMappingURL=field-resolver.js.map