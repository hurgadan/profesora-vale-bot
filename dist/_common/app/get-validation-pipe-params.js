"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationPipeParams = void 0;
const getValidationPipeParams = (showError = false) => ({
    disableErrorMessages: !showError,
    whitelist: true,
    transform: true,
    stopAtFirstError: true,
});
exports.getValidationPipeParams = getValidationPipeParams;
//# sourceMappingURL=get-validation-pipe-params.js.map