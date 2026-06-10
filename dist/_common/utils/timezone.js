"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localToUtc = localToUtc;
exports.utcToLocal = utcToLocal;
function localToUtc(dateStr, timeStr, timezone) {
    const estimated = new Date(`${dateStr}T${timeStr}:00.000Z`);
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })
        .formatToParts(estimated)
        .reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});
    const localAsUtcMs = Date.UTC(Number(parts['year']), Number(parts['month']) - 1, Number(parts['day']), Number(parts['hour']), Number(parts['minute']), Number(parts['second']));
    const offset = localAsUtcMs - estimated.getTime();
    return new Date(estimated.getTime() - offset);
}
function utcToLocal(utcDate, timezone) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
        .formatToParts(utcDate)
        .reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
    }, {});
    return {
        dateStr: `${parts['year']}-${parts['month']}-${parts['day']}`,
        minutes: Number(parts['hour']) * 60 + Number(parts['minute']),
    };
}
//# sourceMappingURL=timezone.js.map