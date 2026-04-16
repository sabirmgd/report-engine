"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTER_FONTS = void 0;
exports.loadFontVfs = loadFontVfs;
const fs_1 = require("fs");
const path_1 = require("path");
const FONT_DIR = __dirname;
exports.INTER_FONTS = {
    Inter: {
        normal: 'Inter-Regular.ttf',
        bold: 'Inter-Bold.ttf',
        italics: 'Inter-Italic.ttf',
        bolditalics: 'Inter-Bold.ttf',
    },
};
let cachedVfs = null;
function loadFontVfs() {
    if (cachedVfs)
        return cachedVfs;
    cachedVfs = {
        'Inter-Regular.ttf': (0, fs_1.readFileSync)((0, path_1.join)(FONT_DIR, 'Inter-Regular.ttf')),
        'Inter-Bold.ttf': (0, fs_1.readFileSync)((0, path_1.join)(FONT_DIR, 'Inter-Bold.ttf')),
        'Inter-Italic.ttf': (0, fs_1.readFileSync)((0, path_1.join)(FONT_DIR, 'Inter-Italic.ttf')),
    };
    return cachedVfs;
}
//# sourceMappingURL=font-loader.js.map