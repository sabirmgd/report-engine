import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';

function buildQuestion(field: ReportFieldDef): string {
  let q = `What is the ${field.label.toLowerCase()}?`;
  if (field.description) q = field.description;
  if (field.type === 'select' && field.options?.length) {
    q += ` Options: ${field.options.join(', ')}.`;
  }
  if (field.type === 'multi_select' && field.options?.length) {
    q += ` Choose one or more from: ${field.options.join(', ')}.`;
  }
  return q;
}

export class InterviewStrategy implements FieldCollectionStrategy {
  async collect(missing: ReportFieldDef[], callbacks: CollectionCallbacks = {}): Promise<Record<string, unknown>> {
    if (!callbacks.onQuestion) throw new Error('InterviewStrategy requires onQuestion callback');
    const answers: Record<string, unknown> = {};
    for (const field of missing) {
      const q = buildQuestion(field);
      const answer = await callbacks.onQuestion(q, field);
      answers[field.key] = answer;
    }
    return answers;
  }
}
