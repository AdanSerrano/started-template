# Documentacion Oficial de Paquetes

> **REGLA:** Antes de implementar o modificar codigo que involucre cualquiera de estos paquetes,
> CONSULTA la documentacion oficial para verificar la API correcta, breaking changes, y mejores practicas.
>
> **NO confies en conocimiento previo** — las APIs cambian entre versiones.
> Usa las URLs de abajo para consultar la version exacta que usa el proyecto.

---

## Framework y Runtime

| Paquete        | Version | Documentacion Oficial                | Notas                                                                        |
| -------------- | ------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| **Next.js**    | 16.x    | https://nextjs.org/docs              | Proxy (antes middleware), React Compiler, `cacheComponents`, instrumentation |
| **React**      | 19.2.x  | https://react.dev/reference/react    | useOptimistic, useActionState, use(), Server Components                      |
| **TypeScript** | 5.9.x   | https://www.typescriptlang.org/docs/ | Strict mode, exactOptionalPropertyTypes                                      |

---

## Estilos y UI

| Paquete                      | Version | Documentacion Oficial                          | Notas                                                                     |
| ---------------------------- | ------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| **Tailwind CSS**             | 4.x     | https://tailwindcss.com/docs                   | v4 rompe nombres: shadow-sm→shadow-xs, rounded-sm→rounded-xs, ring→ring-3 |
| **shadcn/ui**                | —       | https://ui.shadcn.com/docs                     | CLI: `npx shadcn@latest add [component]`                                  |
| **Radix UI**                 | 1.x     | https://www.radix-ui.com/primitives/docs       | Base de shadcn/ui — consultar para customizacion avanzada                 |
| **class-variance-authority** | 0.7.x   | https://cva.style/docs                         | Variantes de componentes                                                  |
| **tailwind-merge**           | 3.x     | https://github.com/dcastil/tailwind-merge      | Resolucion de conflictos de clases Tailwind                               |
| **Lucide React**             | 0.577.x | https://lucide.dev/guide/packages/lucide-react | Iconos — buscar por nombre en https://lucide.dev/icons                    |
| **tw-animate-css**           | 1.x     | https://github.com/Wombosvideo/tw-animate-css  | Animaciones CSS para Tailwind v4                                          |
| **cmdk**                     | 1.x     | https://cmdk.paco.me                           | Command palette                                                           |
| **Sonner**                   | 2.x     | https://sonner.emilkowal.dev                   | Toast notifications                                                       |
| **next-themes**              | 0.4.x   | https://github.com/pacocoursey/next-themes     | Dark/light mode                                                           |
| **Recharts**                 | 3.x     | https://recharts.org/en-US/api                 | Charts — v3 cambio API de v2                                              |
| **React Day Picker**         | 9.x     | https://daypicker.dev                          | Date picker — v9 es rewrite completo vs v8                                |
| **input-otp**                | 1.x     | https://input-otp.rodz.dev                     | OTP input                                                                 |

---

## Base de Datos

| Paquete             | Version | Documentacion Oficial                               | Notas                                                |
| ------------------- | ------- | --------------------------------------------------- | ---------------------------------------------------- |
| **Drizzle ORM**     | 0.45.x  | https://orm.drizzle.team/docs/overview              | Schemas, queries, prepared statements, transacciones |
| **Drizzle Kit**     | 0.31.x  | https://orm.drizzle.team/docs/kit-overview          | Migraciones: generate, migrate, push, studio         |
| **drizzle-zod**     | 0.8.x   | https://orm.drizzle.team/docs/zod                   | Generacion de schemas Zod desde Drizzle              |
| **Neon Serverless** | 1.x     | https://neon.tech/docs/serverless/serverless-driver | WebSocket driver para transacciones, Pool config     |

---

## Autenticacion

| Paquete                 | Version | Documentacion Oficial                             | Notas                                                |
| ----------------------- | ------- | ------------------------------------------------- | ---------------------------------------------------- |
| **Better Auth**         | 1.5.x   | https://www.better-auth.com/docs                  | Session, plugins, cookie cache, hooks, rate limiting |
| **Better Auth Plugins** | —       | https://www.better-auth.com/docs/plugins          | 2FA, admin, magic-link, username, nextCookies        |
| **Better Auth Drizzle** | —       | https://www.better-auth.com/docs/adapters/drizzle | Adapter config, schema mapping                       |

---

## Validacion

| Paquete                 | Version | Documentacion Oficial                        | Notas                                                                              |
| ----------------------- | ------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Zod**                 | 4.x     | https://zod.dev                              | v4: `{ error: }` reemplaza `{ message: }`, breaking change en error map precedence |
| **React Hook Form**     | 7.x     | https://react-hook-form.com/docs             | useForm, Controller, FormProvider                                                  |
| **@hookform/resolvers** | 5.x     | https://github.com/react-hook-form/resolvers | zodResolver para Zod 4                                                             |

---

## Email

| Paquete         | Version | Documentacion Oficial                 | Notas                                       |
| --------------- | ------- | ------------------------------------- | ------------------------------------------- |
| **Resend**      | 6.x     | https://resend.com/docs               | API de envio, rate limits, idempotency keys |
| **React Email** | 5.x     | https://react.email/docs/introduction | Componentes de email, preview CLI           |

---

## Estado y Forms

| Paquete     | Version | Documentacion Oficial                                     | Notas                                               |
| ----------- | ------- | --------------------------------------------------------- | --------------------------------------------------- |
| **Zustand** | 5.x     | https://zustand.docs.pmnd.rs/getting-started/introduction | Selectores atomicos, useShallow, persist middleware |

---

## Internacionalizacion

| Paquete       | Version | Documentacion Oficial                      | Notas                                                     |
| ------------- | ------- | ------------------------------------------ | --------------------------------------------------------- |
| **next-intl** | 4.x     | https://next-intl.dev/docs/getting-started | Server: getTranslations, Client: useTranslations, routing |

---

## Storage y Archivos

| Paquete                 | Version | Documentacion Oficial                                             | Notas                                 |
| ----------------------- | ------- | ----------------------------------------------------------------- | ------------------------------------- |
| **AWS SDK S3**          | 3.x     | https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/ | Compatible con Cloudflare R2          |
| **Sharp**               | 0.34.x  | https://sharp.pixelplumbing.com/api-constructor                   | Image processing — solo server-side   |
| **ExcelJS**             | 4.x     | https://github.com/exceljs/exceljs#readme                         | Lectura/escritura XLSX                |
| **PapaParse**           | 5.x     | https://www.papaparse.com/docs                                    | CSV parsing                           |
| **@react-pdf/renderer** | 4.x     | https://react-pdf.org                                             | Generacion PDF desde React components |

---

## Jobs y Background

| Paquete         | Version | Documentacion Oficial    | Notas                           |
| --------------- | ------- | ------------------------ | ------------------------------- |
| **Trigger.dev** | 4.x     | https://trigger.dev/docs | v4: nuevo SDK, tasks, schedules |

---

## Monitoring y Seguridad

| Paquete              | Version | Documentacion Oficial                                      | Notas                                            |
| -------------------- | ------- | ---------------------------------------------------------- | ------------------------------------------------ |
| **Sentry (Next.js)** | 10.x    | https://docs.sentry.io/platforms/javascript/guides/nextjs/ | Init en instrumentation.ts, source maps, tracing |
| **Pino**             | 10.x    | https://getpino.io/#/                                      | Structured logging, transports, child loggers    |
| **DOMPurify**        | 3.x     | https://github.com/cure53/DOMPurify                        | Sanitizacion HTML — usar en todo input rich text |

---

## Rate Limiting y Cache

| Paquete               | Version | Documentacion Oficial                                     | Notas                                      |
| --------------------- | ------- | --------------------------------------------------------- | ------------------------------------------ |
| **Upstash Redis**     | 1.x     | https://upstash.com/docs/redis/overall/getstarted         | REST-based Redis para serverless           |
| **Upstash Ratelimit** | 2.x     | https://upstash.com/docs/redis/sdks/ratelimit-ts/overview | Sliding window, fixed window, token bucket |

---

## HTTP y Networking

| Paquete   | Version | Documentacion Oficial             | Notas                                     |
| --------- | ------- | --------------------------------- | ----------------------------------------- |
| **Axios** | 1.x     | https://axios-http.com/docs/intro | Solo en lib/adapters/ — usar via provider |

---

## Utilidades

| Paquete      | Version | Documentacion Oficial                 | Notas                                         |
| ------------ | ------- | ------------------------------------- | --------------------------------------------- |
| **nanoid**   | 5.x     | https://github.com/ai/nanoid#readme   | Generador de IDs unicos — alternativa a UUID  |
| **clsx**     | 2.x     | https://github.com/lukeed/clsx#readme | Construccion condicional de class names       |
| **entities** | 4.x     | https://github.com/fb55/entities      | Encode/decode HTML entities                   |
| **ws**       | 8.x     | https://github.com/websockets/ws      | WebSocket client para Neon serverless en Node |

---

## Testing

| Paquete                   | Version | Documentacion Oficial                                        | Notas                                                      |
| ------------------------- | ------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **Vitest**                | 4.x     | https://vitest.dev/guide/                                    | Config, mocking, coverage — v4 cambio API de v3            |
| **Playwright**            | 1.58.x  | https://playwright.dev/docs/intro                            | E2E tests, page objects, assertions                        |
| **Testing Library React** | 16.x    | https://testing-library.com/docs/react-testing-library/intro | render, screen, userEvent                                  |
| **MSW**                   | 2.x     | https://mswjs.io/docs                                        | Mock Service Worker — intercepta network requests en tests |

---

## Dev Tools

| Paquete         | Version | Documentacion Oficial                      | Notas                                     |
| --------------- | ------- | ------------------------------------------ | ----------------------------------------- |
| **ESLint**      | 9.x     | https://eslint.org/docs/latest/            | Flat config (eslint.config.mjs)           |
| **Prettier**    | 3.x     | https://prettier.io/docs/en/               | Con plugin tailwindcss para class sorting |
| **Husky**       | 9.x     | https://typicode.github.io/husky/          | Git hooks                                 |
| **lint-staged** | 16.x    | https://github.com/lint-staged/lint-staged | Pre-commit linting                        |
| **Knip**        | 5.x     | https://knip.dev                           | Deteccion de codigo muerto                |

---

## Como usar esta referencia

### Al implementar una feature nueva:

1. Identifica que paquetes vas a tocar
2. Abre la documentacion oficial de cada uno
3. Verifica la API para la **version exacta** del proyecto (ver `package.json`)
4. Busca la seccion de **migration guide** si hay cambio de version mayor

### Al debuggear un error:

1. Busca el error en la documentacion oficial del paquete
2. Revisa el changelog para breaking changes entre versiones
3. Consulta los **GitHub Issues** del paquete si la documentacion no cubre el caso

### Al agregar una dependencia nueva:

1. Verifica compatibilidad con el stack actual (Next.js 16 + React 19.2)
2. Prefiere paquetes que soporten Server Components nativamente
3. Documenta la URL oficial aqui antes de usarla
4. Crea adapter en `lib/adapters/` + interface en `lib/interfaces/`
