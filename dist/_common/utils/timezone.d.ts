export declare function localToUtc(dateStr: string, timeStr: string, timezone: string): Date;
export declare function utcToLocal(utcDate: Date, timezone: string): {
    dateStr: string;
    minutes: number;
};
