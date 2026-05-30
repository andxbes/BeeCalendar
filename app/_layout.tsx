import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { loadCalendars } from "@/lib/calendar-storage";
import {
  requestNotificationPermissions,
  syncAllCalendarNotifications,
} from "@/lib/notifications";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    void (async () => {
      await requestNotificationPermissions();
      const calendars = await loadCalendars();
      await syncAllCalendarNotifications(calendars);
    })();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "BeeCalendar" }} />
        <Stack.Screen
          name="calendar/[id]"
          options={{ title: "Календарь" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
