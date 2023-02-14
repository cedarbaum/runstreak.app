import { Settings } from "./SettingsContext";

export function getDistanceUnit(settings: Settings | null): string {
    return settings?.distance_unit ?? "mi"
}

export function getTimeZone(settings: Settings | null): string {
    return settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}
