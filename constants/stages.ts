export type CalendarStage = {
  day: number;
  title: string;
  description: string;
  important: boolean;
};

/** Етапи розвитку матки (день від прищепки → подія). День 0 — день прищепки. */
export const STAGES: CalendarStage[] = [
  {
    day: 0,
    title: "📅 День прищепки",
    description: "Перенесення личинок (прищепка).",
    important: true,
  },
  {
    day: 3,
    title: "🔍 Перевірка приймання",
    description: "Перевірте, скільки личинок прийняла сім'я-вихователька.",
    important: false,
  },
  {
    day: 5,
    title: "🧱 Закриття",
    description: "Бджоли закривають маточники. Обережно, не трясіть!",
    important: false,
  },
  {
    day: 10,
    title: "📦 Ізоляція / Перенесення",
    description:
      "Перенесення маточників у нуклеуси або клітинки (за 2 дні до виходу).",
    important: true,
  },
  {
    day: 12,
    title: "👑 Вихід маток",
    description: "Народження маток. Перевірка виходу.",
    important: true,
  },
  {
    day: 17,
    title: "✈️ Обліт",
    description: "Орієнтовні та шлюбні обльоти (за гарної погоди).",
    important: false,
  },
  {
    day: 25,
    title: "🥚 Перевірка засіву",
    description: "Контроль яйцекладки. Якщо є яйця — матка плідна.",
    important: true,
  },
];
