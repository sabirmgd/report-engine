import type { FieldCollectionStrategy, CollectionCallbacks } from './types.js';
import type { ReportFieldDef } from '../../core/registry.js';

export class FullRequirementsStrategy implements FieldCollectionStrategy {
  async collect(missing: ReportFieldDef[], callbacks: CollectionCallbacks = {}): Promise<Record<string, unknown>> {
    if (!callbacks.onPresentAll) throw new Error('FullRequirementsStrategy requires onPresentAll callback');
    return callbacks.onPresentAll(missing);
  }
}
