"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestingAppAndHttpServer = void 0;
const common_1 = require("@nestjs/common");
const get_validation_pipe_params_1 = require("../../app/get-validation-pipe-params");
const query_failed_filter_1 = require("../../filters/query-failed.filter");
const createTestingAppAndHttpServer = async (testingModule) => {
    const app = testingModule.createNestApplication();
    app.useGlobalFilters(new query_failed_filter_1.QueryFailedFilter());
    app.useGlobalPipes(new common_1.ValidationPipe((0, get_validation_pipe_params_1.getValidationPipeParams)(true)));
    await app.init();
    const httpServer = app.getHttpServer();
    return {
        app,
        httpServer,
    };
};
exports.createTestingAppAndHttpServer = createTestingAppAndHttpServer;
//# sourceMappingURL=create-testing-app-and-http-server.js.map