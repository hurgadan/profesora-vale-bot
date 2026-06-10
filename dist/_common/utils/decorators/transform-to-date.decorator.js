"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformToDate = TransformToDate;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function TransformToDate() {
    return (0, class_transformer_1.Transform)(({ value, key }) => {
        if (typeof value === 'string') {
            if (!(0, class_validator_1.isDateString)(value)) {
                throw new common_1.BadRequestException(`${key} must be a valid ISO 8601 date string`);
            }
            return new Date(value);
        }
        return value;
    });
}
//# sourceMappingURL=transform-to-date.decorator.js.map