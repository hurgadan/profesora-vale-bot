import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
export declare class QueryFailedFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: QueryFailedError, host: ArgumentsHost): void;
}
