import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BeeCalendar } from "@/types/calendar";

const STORAGE_KEY = "@beecalendar/calendars";

export function createCalendarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function loadCalendars(): Promise<BeeCalendar[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as BeeCalendar[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveCalendars(calendars: BeeCalendar[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(calendars));
}

export async function upsertCalendar(calendar: BeeCalendar): Promise<BeeCalendar[]> {
  const calendars = await loadCalendars();
  const index = calendars.findIndex((item) => item.id === calendar.id);
  if (index >= 0) {
    calendars[index] = calendar;
  } else {
    calendars.unshift(calendar);
  }
  await saveCalendars(calendars);
  return calendars;
}

export async function deleteCalendar(id: string): Promise<BeeCalendar[]> {
  const calendars = (await loadCalendars()).filter((item) => item.id !== id);
  await saveCalendars(calendars);
  return calendars;
}

export async function getCalendar(id: string): Promise<BeeCalendar | null> {
  const calendars = await loadCalendars();
  return calendars.find((item) => item.id === id) ?? null;
}
