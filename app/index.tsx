import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { NewCalendarModal } from "@/components/new-calendar-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { STAGES } from "@/constants/stages";
import {
  createCalendarId,
  loadCalendars,
  upsertCalendar,
} from "@/lib/calendar-storage";
import { addDays, formatDateUk, parseLocalDate, toLocalDateString } from "@/lib/dates";
import {
  areNotificationsSupported,
  requestNotificationPermissions,
  syncCalendarNotifications,
} from "@/lib/notifications";
import type { BeeCalendar } from "@/types/calendar";

function getNextImportantStage(startDate: string) {
  const start = parseLocalDate(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const stage of STAGES) {
    if (!stage.important) {
      continue;
    }
    const eventDate = addDays(start, stage.day);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate >= today) {
      return { stage, eventDate };
    }
  }
  return null;
}

export default function CalendarListScreen() {
  const router = useRouter();
  const [calendars, setCalendars] = useState<BeeCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await loadCalendars();
    setCalendars(items);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const handleCreate = async (name: string) => {
    const calendar: BeeCalendar = {
      id: createCalendarId(),
      name,
      startDate: toLocalDateString(new Date()),
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    };

    await upsertCalendar(calendar);
    await requestNotificationPermissions();
    await syncCalendarNotifications(calendar);
    router.push({
      pathname: "/calendar/[id]",
      params: { id: calendar.id },
    } as unknown as Href);
  };

  const renderItem = ({ item }: { item: BeeCalendar }) => {
    const next = getNextImportantStage(item.startDate);

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/calendar/[id]",
            params: { id: item.id },
          } as unknown as Href)
        }
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <ThemedView style={styles.cardInner}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.cardMeta}>
            Прищепка: {formatDateUk(parseLocalDate(item.startDate))}
          </ThemedText>
          {next ? (
            <ThemedText style={styles.cardNext}>
              Найближче: {next.stage.title} — {formatDateUk(next.eventDate)}
            </ThemedText>
          ) : (
            <ThemedText style={styles.cardNext}>Усі важливі етапи пройдені</ThemedText>
          )}
          {areNotificationsSupported() && item.notificationsEnabled && (
            <ThemedText style={styles.badge}>🔔 Сповіщення увімкнено</ThemedText>
          )}
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Календарі матковода</ThemedText>
        <ThemedText style={styles.subtitle}>
          Окремий календар для кожної партії чи вулика
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : calendars.length === 0 ? (
        <ThemedView style={styles.empty}>
          <ThemedText style={styles.emptyText}>
            Поки немає календарів. Створіть перший — вкажіть назву та дату
            прищепки.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={calendars}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <View style={styles.fabContainer}>
        <Pressable
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText style={styles.fabText}>+ Новий календар</ThemedText>
        </Pressable>
      </View>

      <NewCalendarModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreate}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.75,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardInner: {
    padding: 16,
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.8,
  },
  cardNext: {
    marginTop: 8,
    fontSize: 13,
    color: "#D2691E",
  },
  badge: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
  },
  loader: {
    marginTop: 40,
  },
  fabContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  fab: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  fabText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
