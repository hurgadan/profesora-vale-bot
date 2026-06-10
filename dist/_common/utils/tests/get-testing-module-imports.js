"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestingModuleImports = void 0;
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const config_2 = __importDefault(require("../../../_common/app/config"));
const getTestingModuleImports = (entities) => {
    return [
        event_emitter_1.EventEmitterModule.forRoot(),
        config_1.ConfigModule.forRoot({
            isGlobal: true,
            load: [config_2.default],
        }),
        typeorm_1.TypeOrmModule.forRootAsync({
            imports: [config_1.ConfigModule],
            inject: [config_1.ConfigService],
            useFactory: (configService) => {
                const opts = configService.get('databaseConnectionOptions');
                if (!opts)
                    throw new Error('Database config is missing');
                return {
                    ...opts,
                    autoLoadEntities: true,
                    entities: entities ?? undefined,
                };
            },
        }),
    ];
};
exports.getTestingModuleImports = getTestingModuleImports;
//# sourceMappingURL=get-testing-module-imports.js.map