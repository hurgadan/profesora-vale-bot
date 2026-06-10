"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformToDateString = TransformToDateString;
const class_transformer_1 = require("class-transformer");
function TransformToDateString() {
    return (0, class_transformer_1.Transform)(({ value, key, obj }) => {
        const originalValue = obj[key];
        if (originalValue instanceof Date) {
            return originalValue.toISOString();
        }
        return value;
    });
}
//# sourceMappingURL=transform-to-date-string.decorator.js.map