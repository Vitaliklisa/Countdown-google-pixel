import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addYears,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInYears,
} from "date-fns";

export type Remaining = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isPast: boolean;
};

export function remainingUntil(target: Date, now: Date = new Date()): Remaining {
  const totalMs = target.getTime() - now.getTime();
  if (Number.isNaN(totalMs) || totalMs <= 0) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: Number.isNaN(totalMs) ? 0 : totalMs,
      isPast: true,
    };
  }

  const years = differenceInYears(target, now);
  const afterYears = addYears(now, years);
  const months = differenceInMonths(target, afterYears);
  const afterMonths = addMonths(afterYears, months);
  const days = differenceInDays(target, afterMonths);
  const afterDays = addDays(afterMonths, days);
  const hours = differenceInHours(target, afterDays);
  const afterHours = addHours(afterDays, hours);
  const minutes = differenceInMinutes(target, afterHours);
  const afterMinutes = addMinutes(afterHours, minutes);
  const seconds = differenceInSeconds(target, afterMinutes);

  return { years, months, days, hours, minutes, seconds, totalMs, isPast: false };
}

export function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}
