import { DateTime } from "luxon";
import { Settings } from "./SettingsContext";

export function getDistanceUnit(settings: Settings | null): string {
  return settings?.distance_unit ?? "mi";
}

export function getTimeZone(settings: Settings | null): string {
  return settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getMinDistance(settings: Settings | null): number {
  return settings?.min_distance ?? 0;
}

export function formatDateIntl(ts: number, settings: Settings | null): string {
  return Intl.DateTimeFormat().format(
    DateTime.fromMillis(ts).setZone(getTimeZone(settings)).toJSDate()
  );
}

export function formatDate(
  ts: number,
  fmt: string,
  settings: Settings | null
): string {
  return DateTime.fromMillis(ts).setZone(getTimeZone(settings)).toFormat(fmt);
}

export function getDistance(
  distanceMeters: number,
  settings: Settings | null
): string {
  return (
    getDistanceUnit(settings) === "km"
      ? distanceMeters / 1000
      : distanceMeters / 1609.34
  ).toFixed(2);
}
