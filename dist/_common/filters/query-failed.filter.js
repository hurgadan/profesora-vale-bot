"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QueryFailedFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryFailedFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const postgres_error_codes_enum_1 = require("../../database/postgres-error-codes.enum");
let QueryFailedFilter = QueryFailedFilter_1 = class QueryFailedFilter {
    constructor() {
        this.logger = new common_1.Logger(QueryFailedFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const driverError = exception.driverError;
        if (driverError.code === postgres_error_codes_enum_1.PostgresErrorCode.UniqueViolation) {
            const match = driverError.detail?.match(/Key \((.+)\)=/);
            const key = match ? match[1] : 'Record';
            const conflictException = new common_1.ConflictException(`${key} already exists`);
            response.status(common_1.HttpStatus.CONFLICT).json(conflictException.getResponse());
            return;
        }
        this.logger.error(exception.message, exception.stack);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};
exports.QueryFailedFilter = QueryFailedFilter;
exports.QueryFailedFilter = QueryFailedFilter = QueryFailedFilter_1 = __decorate([
    (0, common_1.Catch)(typeorm_1.QueryFailedError)
], QueryFailedFilter);
//# sourceMappingURL=query-failed.filter.js.map