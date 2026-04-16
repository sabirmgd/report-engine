"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_SYSTEM_PROMPT = exports.InsufficientDataError = exports.BatchStrategy = exports.FullRequirementsStrategy = exports.InterviewStrategy = exports.ReportSession = exports.createReportTools = exports.SPACING = exports.TYPOGRAPHY = exports.hslToHex = exports.hexToHsl = exports.formatCurrency = exports.buildPdfStyles = exports.buildPalette = exports.fetchLogoAsDataUri = exports.FieldResolver = exports.ReportRegistry = exports.ReportBuilder = exports.PdfmakeRenderer = void 0;
// Core
var renderer_js_1 = require("./core/renderer.js");
Object.defineProperty(exports, "PdfmakeRenderer", { enumerable: true, get: function () { return renderer_js_1.PdfmakeRenderer; } });
var report_builder_js_1 = require("./core/report-builder.js");
Object.defineProperty(exports, "ReportBuilder", { enumerable: true, get: function () { return report_builder_js_1.ReportBuilder; } });
var registry_js_1 = require("./core/registry.js");
Object.defineProperty(exports, "ReportRegistry", { enumerable: true, get: function () { return registry_js_1.ReportRegistry; } });
var field_resolver_js_1 = require("./core/field-resolver.js");
Object.defineProperty(exports, "FieldResolver", { enumerable: true, get: function () { return field_resolver_js_1.FieldResolver; } });
var pdf_logo_fetcher_js_1 = require("./core/pdf-logo-fetcher.js");
Object.defineProperty(exports, "fetchLogoAsDataUri", { enumerable: true, get: function () { return pdf_logo_fetcher_js_1.fetchLogoAsDataUri; } });
var design_tokens_js_1 = require("./core/design-tokens.js");
Object.defineProperty(exports, "buildPalette", { enumerable: true, get: function () { return design_tokens_js_1.buildPalette; } });
Object.defineProperty(exports, "buildPdfStyles", { enumerable: true, get: function () { return design_tokens_js_1.buildPdfStyles; } });
Object.defineProperty(exports, "formatCurrency", { enumerable: true, get: function () { return design_tokens_js_1.formatCurrency; } });
Object.defineProperty(exports, "hexToHsl", { enumerable: true, get: function () { return design_tokens_js_1.hexToHsl; } });
Object.defineProperty(exports, "hslToHex", { enumerable: true, get: function () { return design_tokens_js_1.hslToHex; } });
Object.defineProperty(exports, "TYPOGRAPHY", { enumerable: true, get: function () { return design_tokens_js_1.TYPOGRAPHY; } });
Object.defineProperty(exports, "SPACING", { enumerable: true, get: function () { return design_tokens_js_1.SPACING; } });
// AI
var tools_js_1 = require("./ai/tools.js");
Object.defineProperty(exports, "createReportTools", { enumerable: true, get: function () { return tools_js_1.createReportTools; } });
Object.defineProperty(exports, "ReportSession", { enumerable: true, get: function () { return tools_js_1.ReportSession; } });
var interview_strategy_js_1 = require("./ai/strategies/interview.strategy.js");
Object.defineProperty(exports, "InterviewStrategy", { enumerable: true, get: function () { return interview_strategy_js_1.InterviewStrategy; } });
var full_requirements_strategy_js_1 = require("./ai/strategies/full-requirements.strategy.js");
Object.defineProperty(exports, "FullRequirementsStrategy", { enumerable: true, get: function () { return full_requirements_strategy_js_1.FullRequirementsStrategy; } });
var batch_strategy_js_1 = require("./ai/strategies/batch.strategy.js");
Object.defineProperty(exports, "BatchStrategy", { enumerable: true, get: function () { return batch_strategy_js_1.BatchStrategy; } });
var types_js_1 = require("./ai/strategies/types.js");
Object.defineProperty(exports, "InsufficientDataError", { enumerable: true, get: function () { return types_js_1.InsufficientDataError; } });
var prompts_js_1 = require("./ai/prompts.js");
Object.defineProperty(exports, "REPORT_SYSTEM_PROMPT", { enumerable: true, get: function () { return prompts_js_1.REPORT_SYSTEM_PROMPT; } });
//# sourceMappingURL=index.js.map