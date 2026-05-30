import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { StartDatePicker } from "@/components/start-date-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { STAGES } from "@/constants/stages";
import {
  deleteCalendar,
  getCalendar,
  upsertCalendar,
} from "@/lib/calendar-storage";
import {
  addDays,
  formatDateRu,
  parseLocalDate,
} from "@/lib/dates";
import {
  areNotificationsSupported,
  cancelCalendarNotifications,
  getNotificationsUnavailableMessage,
  requestNotificationPermissions,
  syncCalendarNotifications,
} from "@/lib/notifications";
import type { BeeCalendar } from "@/types/calendar";

export default function CalendarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [calendar, setCalendar] = useState<BeeCalendar | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }
    const item = await getCalendar(id);
    setCalendar(item);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (updated: BeeCalendar) => {
    setCalendar(updated);
    await upsertCalendar(updated);
    await syncCalendarNotifications(updated);
  };

  const handleStartDateChange = (startDate: string) => {
    if (!calendar) {
      return;
    }
    void persist({ ...calendar, startDate });
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (!calendar) {
      return;
    }

    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Нет разрешения",
          "Разрешите уведомления в настройках Android, чтобы получать напоминания о важных этапах.",
        );
        return;
      }
    }

    await persist({ ...calendar, notificationsEnabled: enabled });
  };

  const confirmDelete = () => {
    if (!calendar) {
      return;
    }

    Alert.alert(
      "Удалить календарь?",
      `«${calendar.name}» и все запланированные уведомления будут удалены.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            await cancelCalendarNotifications(calendar.id);
            await deleteCalendar(calendar.id);
            router.back();
          },
        },
      ],
    );
  };

  if (!calendar) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Календарь" }} />
        <ThemedText style={styles.loading}>Загрузка…</ThemedText>
      </ThemedView>
    );
  }

  const startDate = parseLocalDate(calendar.startDate);

  const renderItem = ({ item }: { item: (typeof STAGES)[0] }) => {
    const eventDate = addDays(startDate, item.day);
    const isToday =
      new Date().toDateString() === eventDate.toDateString();

    return (
      <ThemedView style={[styles.card, isToday && styles.activeCard]}>
        <ThemedView style={styles.dateContainer}>
          <ThemedText type="defaultSemiBold" style={styles.dayOffset}>
            День {item.day}
          </ThemedText>
          <ThemedText style={styles.dateText}>
            {formatDateRu(eventDate)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoContainer}>
          <ThemedText
            type="subtitle"
            style={item.important ? styles.importantTitle : undefined}
          >
            {item.title}
          </ThemedText>
          <ThemedText style={styles.description}>{item.description}</ThemedText>
          {item.important && (
            <ThemedText style={styles.importantBadge}>
              Важное событие · уведомление
            </ThemedText>
          )}
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: calendar.name }} />

      <ThemedView style={styles.controls}>
        <ThemedText type="defaultSemiBold">Дата прививки (день 0)</ThemedText>
        <StartDatePicker
          value={calendar.startDate}
          onChange={handleStartDateChange}
        />

        {areNotificationsSupported() ? (
          <>
            <View style={styles.switchRow}>
              <ThemedText>Уведомления</ThemedText>
              <Switch
                value={calendar.notificationsEnabled}
                onValueChange={toggleNotifications}
              />
            </View>
            <ThemedText style={styles.switchHint}>
              Напоминания в 8:00 в день важных этапов: прививка, перенос, выход
              маток, проверка засева. Работают на телефоне (Android / iOS).
            </ThemedText>
          </>
        ) : (
          <ThemedText style={styles.switchHint}>
            {getNotificationsUnavailableMessage()}
          </ThemedText>
        )}

        <Pressable style={styles.deleteButton} onPress={confirmDelete}>
          <ThemedText style={styles.deleteButtonText}>Удалить календарь</ThemedText>
        </Pressable>
      </ThemedView>

      <FlatList
        data={STAGES}
        keyExtractor={(item) => item.day.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    padding: 20,
    textAlign: "center",
  },
  controls: {
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  switchHint: {
    fontSize: 12,
    opacity: 0.75,
    lineHeight: 18,
  },
  deleteButton: {
    marginTop: 8,
    padding: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#c62828",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
  },
  activeCard: {
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  dateContainer: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: "#444",
    paddingRight: 10,
    marginRight: 10,
    backgroundColor: "transparent",
  },
  infoContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dayOffset: {
    fontSize: 12,
    opacity: 0.7,
  },
  dateText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  importantTitle: {
    color: "#D2691E",
  },
  importantBadge: {
    marginTop: 6,
    fontSize: 11,
    opacity: 0.65,
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});
