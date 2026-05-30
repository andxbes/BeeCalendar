import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import { STAGES } from "@/constants/stages";
import { addDays, parseLocalDate, startOfDay } from "@/lib/dates";
import type { BeeCalendar } from "@/types/calendar";

const ANDROID_CHANNEL_ID = "calendar-events";
const NOTIFICATION_HOUR = 8;
const NOTIFICATION_MINUTE = 0;

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null | undefined;
let handlerInitialized = false;

/** Запуск через приложение Expo Go (не собственная сборка). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/**
 * Локальные уведомления: только Android/iOS в development build или release,
 * не в браузере и не в Expo Go.
 */
export function areNotificationsSupported(): boolean {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return false;
  }
  if (isExpoGo()) {
    return false;
  }
  return true;
}

export function getNotificationsUnavailableMessage(): string | null {
  if (Platform.OS === "web") {
    return "Уведомления доступны в мобильном приложении на Android или iOS.";
  }
  if (isExpoGo()) {
    return "В Expo Go уведомления отключены. Соберите приложение: npm run android:run (или установите APK).";
  }
  return null;
}

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!areNotificationsSupported()) {
    return null;
  }

  if (notificationsModule === undefined) {
    notificationsModule = await import("expo-notifications");
    await initNotificationHandler(notificationsModule);
  }

  return notificationsModule;
}

async function initNotificationHandler(
  Notifications: NotificationsModule,
): Promise<void> {
  if (handlerInitialized) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerInitialized = true;
}

function notificationId(calendarId: string, day: number): string {
  return `calendar-${calendarId}-day-${day}`;
}

async function ensureAndroidChannel(
  Notifications: NotificationsModule,
): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "События календаря",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#D2691E",
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!areNotificationsSupported() || !Device.isDevice) {
    return false;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }

  await ensureAndroidChannel(Notifications);

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function cancelCalendarNotifications(
  calendarId: string,
): Promise<void> {
  if (!areNotificationsSupported()) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .map((item) => item.identifier)
    .filter((id) => id.startsWith(`calendar-${calendarId}-`));

  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}

export async function syncCalendarNotifications(
  calendar: BeeCalendar,
): Promise<void> {
  if (!areNotificationsSupported()) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await cancelCalendarNotifications(calendar.id);

  if (!calendar.notificationsEnabled) {
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) {
    return;
  }

  const startDate = parseLocalDate(calendar.startDate);
  const now = startOfDay(new Date());

  for (const stage of STAGES) {
    if (!stage.important) {
      continue;
    }

    const eventDate = startOfDay(addDays(startDate, stage.day));
    if (eventDate < now) {
      continue;
    }

    const triggerDate = new Date(eventDate);
    triggerDate.setHours(NOTIFICATION_HOUR, NOTIFICATION_MINUTE, 0, 0);

    if (triggerDate <= new Date()) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: notificationId(calendar.id, stage.day),
      content: {
        title: calendar.name,
        body: `${stage.title} — ${stage.description}`,
        data: { calendarId: calendar.id, day: stage.day },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId:
          Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
      },
    });
  }
}

export async function syncAllCalendarNotifications(
  calendars: BeeCalendar[],
): Promise<void> {
  if (!areNotificationsSupported()) {
    return;
  }

  for (const calendar of calendars) {
    await syncCalendarNotifications(calendar);
  }
}
