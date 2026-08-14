// Pure slot-generation domain logic — no DB, no framework. Fully unit-testable.
//
// A slot is bookable when it fits entirely inside a provider availability
// window for that weekday and overlaps no CONFIRMED appointment. Times are
// treated as UTC (multi-timezone providers are out of scope for v1).

export interface SlotServiceInput {
  durationMin: number;
}

export interface AvailabilityWindowInput {
  weekday: number; // 0..6 (UTC getUTCDay)
  startMin: number; // minutes from midnight
  endMin: number;
}

export interface AppointmentInterval {
  startAt: Date;
  endAt: Date;
}

export interface SlotRange {
  from: Date;
  to: Date;
}

export interface Slot {
  start: Date;
  end: Date;
}

const MS_PER_MIN = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MIN;

// Midnight (UTC) of the day containing `d`.
function utcDayStart(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Half-open intervals: touching edges (back-to-back) do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

export function generateSlots(
  service: SlotServiceInput,
  availability: AvailabilityWindowInput[],
  existingAppointments: AppointmentInterval[],
  range: SlotRange,
  options: { stepMin?: number } = {},
): Slot[] {
  const step = options.stepMin ?? 30;
  const duration = service.durationMin;
  if (duration <= 0 || step <= 0) return [];

  const fromMs = range.from.getTime();
  const toMs = range.to.getTime();
  if (!(fromMs < toMs)) return [];

  // Pre-extract busy intervals as ms for cheap overlap checks.
  const busy = existingAppointments.map((a) => ({
    start: a.startAt.getTime(),
    end: a.endAt.getTime(),
  }));

  const slots: Slot[] = [];

  // Walk each UTC day touched by the range.
  for (
    let dayMs = utcDayStart(range.from);
    dayMs <= toMs;
    dayMs += MS_PER_DAY
  ) {
    const weekday = new Date(dayMs).getUTCDay();
    for (const w of availability) {
      if (w.weekday !== weekday) continue;
      // Grid starts on `step`; slot must fit fully inside the window.
      for (let m = w.startMin; m + duration <= w.endMin; m += step) {
        const startMs = dayMs + m * MS_PER_MIN;
        const endMs = startMs + duration * MS_PER_MIN;
        // Slot must start within the requested range.
        if (startMs < fromMs || startMs >= toMs) continue;
        if (busy.some((b) => overlaps(startMs, endMs, b.start, b.end))) continue;
        slots.push({ start: new Date(startMs), end: new Date(endMs) });
      }
    }
  }

  slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  return slots;
}

// True if `start` is a legitimate slot start for the service: on the grid,
// on an available weekday, and fully inside a window. Used to reject arbitrary
// booking times regardless of appointment overlap (that is checked separately).
export function isValidSlotStart(
  service: SlotServiceInput,
  availability: AvailabilityWindowInput[],
  start: Date,
  stepMin = 30,
): boolean {
  const duration = service.durationMin;
  if (duration <= 0 || stepMin <= 0) return false;
  const startMs = start.getTime();
  if (!Number.isFinite(startMs)) return false;

  const minuteOfDay = (startMs - utcDayStart(start)) / MS_PER_MIN;
  if (!Number.isInteger(minuteOfDay)) return false;
  const endMinute = minuteOfDay + duration;
  const weekday = start.getUTCDay();

  return availability.some(
    (w) =>
      w.weekday === weekday &&
      minuteOfDay >= w.startMin &&
      endMinute <= w.endMin &&
      (minuteOfDay - w.startMin) % stepMin === 0,
  );
}
