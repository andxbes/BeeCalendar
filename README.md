# BeeCalendar

Календар матковода для Android, iOS та Web. Окремий календар на кожну партію чи вулик,
нагадування про важливі етапи розвитку матки.

**Технічна документація:** [docs/TECHNICAL.md](docs/TECHNICAL.md) — оновлюйте її при кожній суттєвій зміні в проєкті.

## Швидкий старт

```bash
npm install
npx expo start
```

У консолі з'являться варіанти запуску: емулятор Android, симулятор iOS, Expo Go або веб.

## Збірка APK

```bash
# Скопіюйте .env.example → .env і додайте EXPO_TOKEN
npm run build:apk
npm run download:apk   # завантажить APK у builds/
```

## Структура

- `app/` — екрани (Expo Router)
- `components/` — UI-компоненти
- `constants/stages.ts` — етапи календаря
- `lib/` — зберігання, дати, сповіщення
- `docs/TECHNICAL.md` — архітектура та правила ведення документації

## Ліцензія

Приватний проєкт.
