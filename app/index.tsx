import { Stack } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

// Этапы развития матки (день от прививки -> событие)
// День 0 - это день прививки (Grafting)
const STAGES = [
  {
    day: 0,
    title: "📅 День прививки",
    description: "Перенос личинок (Grafting).",
    important: true,
  },
  {
    day: 3,
    title: "🔍 Проверка приема",
    description: "Проверьте, сколько личинок принято семьей-воспитательницей.",
    important: false,
  },
  {
    day: 5,
    title: "🧱 Запечатывание",
    description: "Пчелы запечатывают маточники. Осторожно, не трясти!",
    important: false,
  },
  {
    day: 10,
    title: "📦 Изоляция / Перенос",
    description:
      "Перенос маточников в нуклеусы или клеточки (за 2 дня до выхода).",
    important: true,
  },
  {
    day: 12,
    title: "👑 Выход маток",
    description: "Рождение маток. Проверка выхода.",
    important: true,
  },
  {
    day: 17,
    title: "✈️ Облет",
    description: "Ориентировочные и брачные облеты (при хорошей погоде).",
    important: false,
  },
  {
    day: 25,
    title: "🥚 Проверка засева",
    description: "Контроль яйцекладки. Если есть яйца — матка плодная.",
    important: true,
  },
];

function RearingCalendarScreen() {
  // По умолчанию считаем от сегодняшнего дня
  const [startDate, setStartDate] = useState(new Date());

  // Функция добавления дней к дате
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Форматирование даты (ДД.ММ.ГГГГ)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      weekday: "short",
    });
  };

  const renderItem = ({ item }: { item: (typeof STAGES)[0] }) => {
    const eventDate = addDays(startDate, item.day);
    const isToday = new Date().toDateString() === eventDate.toDateString();

    return (
      <ThemedView style={[styles.card, isToday && styles.activeCard]}>
        <ThemedView style={styles.dateContainer}>
          <ThemedText type="defaultSemiBold" style={styles.dayOffset}>
            День {item.day}
          </ThemedText>
          <ThemedText style={styles.dateText}>
            {formatDate(eventDate)}
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
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Календарь матковода" }} />

      <ThemedView style={styles.header}>
        <ThemedText type="title">Партия от {formatDate(startDate)}</ThemedText>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setStartDate(new Date())}
        >
          <ThemedText style={styles.buttonText}>Сбросить на сегодня</ThemedText>
        </TouchableOpacity>
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

export default RearingCalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(150, 150, 150, 0.1)", // Легкий фон для карточки
  },
  activeCard: {
    borderColor: "#FFD700", // Золотой цвет для "сегодня"
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
    color: "#D2691E", // Шоколадный цвет для важных событий
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
