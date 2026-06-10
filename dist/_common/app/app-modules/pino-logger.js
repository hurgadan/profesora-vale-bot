"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestjs_pino_1 = require("nestjs-pino");
exports.default = nestjs_pino_1.LoggerModule.forRoot({
    pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { colorize: true },
            }
            : undefined,
        serializers: {
            req(req) {
                return {
                    id: req.id,
                    method: req.method,
                    url: req.url,
                };
            },
        },
    },
});
//# sourceMappingURL=pino-logger.js.map