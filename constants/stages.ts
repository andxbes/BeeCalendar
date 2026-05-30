export type CalendarStage = {
  day: number;
  title: string;
  description: string;
  important: boolean;
};

/** Этапы развития матки (день от прививки → событие). День 0 — день прививки. */
export const STAGES: CalendarStage[] = [
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
