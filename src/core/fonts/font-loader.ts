import { readFileSync } from 'fs';
import { join } from 'path';

const FONT_DIR = __dirname;

export const INTER_FONTS = {
  Inter: {
    normal: 'Inter-Regular.ttf',
    bold: 'Inter-Bold.ttf',
    italics: 'Inter-Italic.ttf',
    bolditalics: 'Inter-Bold.ttf',
  },
};

let cachedVfs: Record<string, Buffer> | null = null;

export function loadFontVfs(): Record<string, Buffer> {
  if (cachedVfs) return cachedVfs;
  cachedVfs = {
    'Inter-Regular.ttf': readFileSync(join(FONT_DIR, 'Inter-Regular.ttf')),
    'Inter-Bold.ttf': readFileSync(join(FONT_DIR, 'Inter-Bold.ttf')),
    'Inter-Italic.ttf': readFileSync(join(FONT_DIR, 'Inter-Italic.ttf')),
  };
  return cachedVfs;
}
