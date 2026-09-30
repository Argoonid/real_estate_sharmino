# Sharmino Real Estate 🌴🇪🇬

Ведущая платформа недвижимости в Шарм-эль-Шейхе (Египет): чистая продакшен-архитектура на базе **React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase PostgreSQL**.

---

## 🚀 Быстрый запуск на локальном компьютере

### Требования
- **Node.js**: версия 20.19+ или 22.12+
- **npm**: версия 10+

### 1. Установка зависимостей
Откройте терминал в папке проекта:
```bash
npm install
```
### 2. Запуск локального сервера разработки
```bash
npm run dev
```

После запуска в консоли появится адрес:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<ваш-ip>:3000/
```
Откройте **`http://localhost:3000`** в браузере.

---

## ⚙️ Конфигурация окружения

Создайте `.env` в корне проекта и укажите публичные параметры Supabase:

```env
# Используйте anon/public key; service_role key нельзя помещать во фронтенд.
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
# Optional; removes the "API key required" watermark from the CARTO street basemap.
VITE_CARTO_API_KEY=your-carto-basemaps-key
# Optional; GA4 is loaded only after the visitor opts in to analytics.
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Use the project API URL and a publishable key from Supabase API Keys. Do not put a PostgreSQL connection string or a secret/service-role key in the frontend environment. Legacy anon keys are also supported via `VITE_SUPABASE_ANON_KEY`.

The street map uses CARTO raster tiles. Request a key at [CARTO Basemaps](https://carto.com/basemaps/apikey/), then restrict the production key to the exact website hostnames in the [CARTO Basemaps dashboard](https://dashboard.basemaps.carto.com). Use a separate key for local development (`localhost` / `127.0.0.1`); a local-development restricted key cannot also be restricted to public website domains. Browser keys are visible to users, so protect them with hostname restrictions and usage monitoring. CARTO currently includes up to 1 million tile requests per calendar month for commercial use, aggregated across account keys and raster/vector basemaps; higher usage requires a paid plan. See [CARTO basemap pricing and terms](https://docs.carto.com/faqs/carto-basemaps.md).

---

## 🗄️ Развертывание базы данных в Supabase

1. Зарегистрируйтесь на [supabase.com](https://supabase.com) и создайте проект.
2. Перейдите в раздел **SQL Editor**.
3. Откройте файл `supabase/schema.sql` из этого проекта, вставьте его в SQL Editor и нажмите **Run**.
   - Скрипт создаст таблицы `properties`, `districts`, `leads` и RLS-политики. Публичная отправка заявок ограничена статусом `pending`; администраторский доступ требует `app_metadata.role = 'admin'`.
4. Скопируйте `Project URL` и `anon public key` из **Project Settings → API** в `.env`. Никогда не помещайте service-role key во фронтенд.
5. Районы и объекты загружаются из Supabase; каталог применяет фильтры и постраничную выборку через PostgREST.

### Создание учётной записи администратора

1. В Supabase Dashboard откройте **Authentication → Users → Add user** и создайте пользователя с уникальным сильным паролем. Не используйте общий или уже применяемый где-либо пароль.
2. Скопируйте ID созданного пользователя. В **SQL Editor** выполните запрос, заменив UUID на его ID:

   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   WHERE id = 'UUID-ПОЛЬЗОВАТЕЛЯ';
   ```

3. Войдите в админ-панель email и паролем этого пользователя. Если он уже был авторизован, выйдите и войдите снова, чтобы получить JWT с новой ролью.

Роль хранится в `app_metadata`, который нельзя менять из обычного клиентского API; не назначайте админов через `user_metadata`. Публичный ключ Supabase находится во фронтенде по назначению — доступ к данным ограничивают RLS-политики, а секретный `service_role` key туда помещать нельзя. Проверяйте RLS при изменениях схемы. Эта защита не исключает кражу пароля, фишинг, вредоносное ПО или компрометацию почты: используйте менеджер паролей и периодически проверяйте активные сессии и журналы Auth. Перед включением MFA для администратора проверьте её обязательность на уровне RLS (`aal2`) и добавьте в приложение обработку MFA challenge; одного включённого фактора недостаточно, чтобы эта версия приложения требовала MFA при доступе к базе.

Ссылка `/admin` и сочетание **Ctrl+Shift+A** (на macOS — **Cmd+Shift+A**) открывают экран входа в CRM; это только скрывает точку входа, а не заменяет авторизацию Supabase и проверку роли администратора.

Для уже развёрнутой базы примените один раз SQL из [`supabase/restrict_public_lead_status.sql`](./supabase/restrict_public_lead_status.sql), чтобы публичный клиент не мог отправлять заявки с поддельным статусом. Новая база получает это ограничение из `schema.sql`.

---

## 📱 PWA (Прогрессивное веб-приложение)
Production-сборка включает web manifest, installable icons и service worker с обновлением приложения. Для установки сайт должен быть опубликован по HTTPS. На Android и в поддерживаемых настольных браузерах кнопка установки открывает системный диалог; если браузер не предоставляет такой диалог, кнопка показывает инструкцию для его меню. На iPhone/iPad добавление на домашний экран выполняется через Safari → «Поделиться» → «На экран Домой»; браузер требует подтвердить это действие, поэтому полностью автоматическая установка одним кликом невозможна.

Статические файлы приложения кэшируются service worker. Данные каталога, карта и отправка заявок загружаются из Supabase и требуют подключения к интернету. В dev-режиме service worker выключен, чтобы не мешать HMR и не показывать устаревшую версию сайта.

## 🍪 Согласие и аналитика
Без `VITE_GA_MEASUREMENT_ID` Google Analytics не загружается и сайт сообщает об этом посетителю. Чтобы включить статистику посещений, создайте ресурс GA4, добавьте его Measurement ID (`G-...`) в переменные production-сборки и пересоберите сайт. Скрипт Google Analytics и отправка SPA page views запускаются только после явного согласия посетителя; выбор можно изменить в «Настройки конфиденциальности» в окне настроек. Настройки интерфейса и избранное сохраняются в браузере, а отправленная форма — в таблице `leads` Supabase. Не используйте этот функционал как замену юридической проверке требований о согласии и политике конфиденциальности в целевых странах.

## 📩 Уведомления о заявках в Telegram
Токен Telegram-бота и ключ `service_role` используются только серверной Supabase Edge Function. Браузер отправляет заявку исключительно в `public.leads`; Telegram-уведомление работает только после настройки описанных ниже шагов:

1. Создайте бота у [@BotFather](https://t.me/BotFather). Чтобы получать уведомления в личке, каждый администратор должен сначала открыть бота и нажать **Start**. Для группового чата добавьте бота в группу; при необходимости повысьте его права. Получите ID целевого чата безопасным способом, не публикуя его вместе с токеном.
2. Примените [`supabase/add_property_source_contact.sql`](./supabase/add_property_source_contact.sql) к уже существующей базе. Новая база получает поле `source_contact` из `schema.sql`. Эта колонка позволяет передавать исходный контакт вместе с `source_platform`, `source_origin_url` и `source_external_id`.
3. Установите и авторизуйте Supabase CLI, затем разверните функцию из корня проекта:

   ```bash
   supabase functions deploy notify-new-lead
   ```

4. Для локального запуска функции скопируйте [`supabase/functions/.env.example`](./supabase/functions/.env.example) в `supabase/functions/.env` и заполните его значениями. Этот файл исключён из git. Для production задайте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (основная группа/чат, необязательно при наличии списка администраторов), `TELEGRAM_ADMIN_CHAT_IDS` (необязательный список ID через запятую), `DATABASE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` и `PUBLIC_SITE_URL` в Supabase Dashboard → **Edge Functions → Secrets**. Можно загрузить набор через Supabase CLI: `supabase secrets set --env-file supabase/functions/.env`. Токен уже содержит ID бота, отдельная переменная `TELEGRAM_BOT_ID` не нужна. Секрет должен быть случайным длинным значением и одинаково заданным в webhook header и среди secrets функции. Никогда не добавляйте эти значения в клиентский `.env`, не добавляйте префикс `VITE_`, не коммитьте и не отправляйте их в переписке.
5. Создайте в Supabase **Database Webhook** для `public.leads`, событие **INSERT**, метод **POST** и URL функции `https://<project-ref>.supabase.co/functions/v1/notify-new-lead`. Добавьте HTTP-заголовок `x-webhook-secret: <тот же DATABASE_WEBHOOK_SECRET>` и `Content-Type: application/json`. Сделайте тестовую заявку и проверьте логи функции и целевые Telegram-чаты.

Функция повторно читает заявку и объект из базы, формирует уведомление с данными заявки, ссылкой на карточку и известными полями источника. Если исходный сайт/пост или контакт не заполнен у объекта, функция не может восстановить эти данные автоматически. Для Facebook Lead Ads нужен отдельный серверный интегратор Meta с разрешённым доступом к странице и webhook Graph API: database webhook сайта сам по себе не получает лиды Facebook. Обрабатывайте Meta access token только на сервере и соблюдайте правила хранения/согласия Meta.

Проверьте журналы Edge Function после пробной заявки: запись в `leads` остаётся успешной, даже если отправка Telegram временно не удалась; сообщения Telegram не являются единственным хранилищем заявок. При повторной доставке webhook возможны повторные уведомления.

## 💱 Курсы и конвертация валют
Курсы USD, EUR, GBP, EGP и RUB загружаются раз в сутки с [ExchangeRate-API](https://www.exchangerate-api.com), кэшируются в браузере и используются для пересчёта исходной цены объекта в выбранную валюту. Отображаемая цена округляется до целого числа; границы фильтра цены пересчитываются по тем же курсам. Ссылка на источник курсов отображается внизу сайта и в настройках валюты. Если сервис курсов недоступен, цены остаются в исходной валюте объекта, а ценовой фильтр ждёт получения курса.
