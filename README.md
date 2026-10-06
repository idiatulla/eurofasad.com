# eurofasad.com

Статическая копия сайта (бывший WordPress/Elementor) для Cloudflare Pages + форма обратной связи на Pages Function.

Структура: `css/`, `js/`, `images/`, `fonts/`, `lib/` (скрипты библиотек Elementor), `files/` (PDF-документы).
Elementor подгружает часть чанков динамически из корня сайта (`/js/*.bundle.min.js`, `/css/conditionals/*`, `/lib/*`) — не переименовывайте эти папки.

## Деплой
Cloudflare Pages → Connect to Git → этот репозиторий. Build command — пусто, output directory — `/`.
Папка `functions/` подхватывается автоматически: `POST /api/contact`.

## Форма обратной связи
`functions/api/contact.js` отправляет письмо через [Resend](https://resend.com).
Переменные окружения (Pages → Settings → Environment variables, Production и Preview):

| Переменная | Описание |
|---|---|
| `RESEND_API_KEY` | API-ключ Resend (Secret) |
| `MAIL_TO` | адрес(а) получателя, через запятую |
| `MAIL_FROM` | отправитель, например `Eurofasad <noreply@eurofasad.com>`; домен должен быть подтверждён в Resend |

Локально: скопировать `.dev.vars.example` в `.dev.vars`, затем `npx wrangler pages dev .`
Защита от спама: скрытое поле-ловушка (honeypot) и валидация на сервере.
