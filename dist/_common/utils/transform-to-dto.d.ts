import { Type } from '@nestjs/common';
export declare function transformToDto<T>(type: Type<T>, source: unknown): T;
