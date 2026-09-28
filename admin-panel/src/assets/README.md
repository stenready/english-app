# Assets

← [Admin Panel](../../README.md) · [API](../api/README.md)

**Українська** | [English](./README.en.md)

Стилі та статичні файли застосунку.

```
assets/
├── images/        # зображення, що імпортуються в коді
├── main.scss      # CSS-змінні теми (світла / темна) і глобальні стилі
└── tailwind.css   # підключення Tailwind і зв'язок змінних з утилітами
```

Обидва файли стилів підключаються в `main.ts` саме в такому порядку:

```ts
import './assets/tailwind.css'
import './assets/main.scss'
```

---

## ⚠️ Головне правило

**Кожна змінна, додана в `main.scss`, має бути продубльована в `tailwind.css` у блоці `@theme inline`.**

Інакше Tailwind нічого про неї не знає і не згенерує класи: `bg-danger` просто не працюватиме, **без жодної помилки** ні в консолі, ні під час збірки.

### Чому так

| Файл           | Що робить                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `main.scss`    | Зберігає **значення** змінних і перемикає їх між темами (`:root` і `[data-theme="dark"]`)                          |
| `tailwind.css` | Каже Tailwind: «для цієї змінної згенеруй класи» (`--color-danger` → `bg-danger`, `text-danger`, `border-danger`…) |

`@theme inline` підставляє в класи посилання на змінну з `main.scss` (`var(--danger)`), тому при зміні теми класи автоматично беруть нове значення, і `dark:` для кольорів не потрібен.

---

## Як додати нову змінну

Приклад: колір `danger`.

**1. `main.scss`** — значення для **обох** тем:

```scss
:root {
  // ...
  --danger: #dc2626;
}

[data-theme='dark'] {
  // ...
  --danger: #f87171;
}
```

**2. `tailwind.css`** — зв'язок з Tailwind:

```css
@theme inline {
  /* ... */
  --color-danger: var(--danger);
}
```

**3. Використання:**

```vue
<button class="bg-danger text-primary-foreground">Видалити</button>
```

### Чекліст

- [ ] Змінна є в `:root` у `main.scss`
- [ ] Змінна є в `[data-theme="dark"]` у `main.scss`
- [ ] Змінна продубльована в `@theme inline` у `tailwind.css` з правильним префіксом
- [ ] Клас працює у світлій **і** темній темі

---

## Іменування

У `main.scss` — коротка назва **без** префікса. У `tailwind.css` — та сама назва **з** префіксом простору імен Tailwind.

| `main.scss`         | `tailwind.css`                       | Класи                                                       |
| ------------------- | ------------------------------------ | ----------------------------------------------------------- |
| `--danger`          | `--color-danger: var(--danger)`      | `bg-danger`, `text-danger`, `border-danger`, `ring-danger`… |
| `--card` (радіус)   | `--radius-card: var(--card)`         | `rounded-card`                                              |
| `--elevated` (тінь) | `--shadow-elevated: var(--elevated)` | `shadow-elevated`                                           |

Префікс визначає, які класи згенерує Tailwind: `--color-*` → кольори, `--radius-*` → `rounded-*`, `--shadow-*` → `shadow-*`, `--font-*` → `font-*`.

> Не давайте змінній у `main.scss` ту саму назву, що й у `@theme` (наприклад, `--color-danger` в обох файлах). Tailwind тоді згенерує `--color-danger: var(--color-danger)` — змінну, що посилається сама на себе. Зараз це випадково працює: `main.scss` не входить у жоден `@layer`, тому він сильніший за рядок Tailwind з `@layer theme`. Але якщо `main.scss` колись загорнуть у `@layer`, кольори мовчки зламаються.

---

## Поточні змінні

| Змінна                 | Tailwind                     | Для чого                 |
| ---------------------- | ---------------------------- | ------------------------ |
| `--background`         | `bg-background`              | Фон сторінки             |
| `--foreground`         | `text-foreground`            | Основний текст           |
| `--surface`            | `bg-surface`                 | Фон карток, панелей      |
| `--surface-foreground` | `text-surface-foreground`    | Текст на `surface`       |
| `--border`             | `border-border`              | Межі                     |
| `--muted`              | `text-muted`                 | Другорядний текст        |
| `--primary`            | `bg-primary`, `text-primary` | Основний акцентний колір |
| `--primary-foreground` | `text-primary-foreground`    | Текст на `primary`       |

---

## Теми

Темна тема вмикається атрибутом на `<html>`:

```ts
document.documentElement.dataset.theme = 'dark' // темна
delete document.documentElement.dataset.theme // світла
```

Кольори з таблиці вище перемикаються самі — окремі класи для темної теми не потрібні.

---

## `images/`

Зображення, які використовуються в коді, імпортуються — тоді Vite додасть хеш до імені файлу і правильно закешує його:

```vue
<script setup lang="ts">
import logoUrl from '@/assets/images/logo.svg'
</script>

<template>
  <img :src="logoUrl" alt="Logo" />
</template>
```

Файли, які мають бути доступні за фіксованою адресою (`favicon.ico`, `robots.txt`), кладемо в `public/`, а не сюди.
