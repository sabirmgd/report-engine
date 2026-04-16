"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewStrategy = void 0;
function buildQuestion(field) {
    let q = `What is the ${field.label.toLowerCase()}?`;
    if (field.description)
        q = field.description;
    if (field.type === 'select' && field.options?.length) {
        q += ` Options: ${field.options.join(', ')}.`;
    }
    if (field.type === 'multi_select' && field.options?.length) {
        q += ` Choose one or more from: ${field.options.join(', ')}.`;
    }
    return q;
}
class InterviewStrategy {
    async collect(missing, callbacks = {}) {
        if (!callbacks.onQuestion)
            throw new Error('InterviewStrategy requires onQuestion callback');
        const answers = {};
        for (const field of missing) {
            const q = buildQuestion(field);
            const answer = await callbacks.onQuestion(q, field);
            answers[field.key] = answer;
        }
        return answers;
    }
}
exports.InterviewStrategy = InterviewStrategy;
//# sourceMappingURL=interview.strategy.js.map