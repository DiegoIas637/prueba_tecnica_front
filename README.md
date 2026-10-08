# SeguraVida — Frontend (React + TypeScript)

Pantalla única para registrar y consultar ventas de seguros de accidentes de la campaña
**SeguraVida**, con cupos limitados. Este repositorio contiene **solo el frontend**; consume
una API REST externa (backend C# .NET) que no se incluye aquí.

Cubre los requisitos R1–R5 del enunciado: consultar planes, registrar ventas, mantener
resultados consistentes (reglas aplicadas en el backend), consultar ventas propias del asesor
activo y manejar espera/errores en pantalla.

---

## Stack y versiones

Versiones realmente usadas en el entorno de desarrollo (ver `package.json`):

| Herramienta             | Versión    | Rol                                             |
| ----------------------- | ---------- | ----------------------------------------------- |
| React                   | 19.2       | UI                                              |
| TypeScript              | 6.0        | Tipado                                          |
| Vite                    | 8.3        | Dev server, build y proxy a la API              |
| @tanstack/react-query   | 5.104      | Fetching, caché, invalidación y estado de red   |
| Tailwind CSS            | 4.3        | Estilos (tema pastel)                           |
| framer-motion           | 14.0       | Animaciones                                     |
| lucide-react            | 1.53       | Iconos                                          |
| Vitest + Testing Library| 5.0 / 16.3 | Pruebas automatizadas (`jsdom`)                 |
| oxlint                  | 1.81       | Linter                                          |

El esqueleto parte de la plantilla oficial de Vite (`react-ts`). Se le retiró el contenido de
demostración y se añadió la lógica de negocio del reto.

---

## Requisitos previos

- Node.js 20+ y npm.
- El **backend** corriendo y accesible (por defecto `https://localhost:7036`).

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el frontend en modo desarrollo
npm run dev
```

Vite imprime la URL local (p. ej. `http://localhost:5173/`; usa el siguiente puerto libre si
está ocupado). Abre esa URL en el navegador.

Otros comandos:

```bash
npm run build    # type-check (tsc -b) + build de producción en dist/
npm run preview  # sirve el build de producción
npm run lint     # oxlint
```

---

## Conexión con el backend (proxy)

El cliente HTTP (`src/api/client.ts`) hace peticiones a rutas **relativas** (`/api/...`). En
desarrollo, Vite las redirige al backend mediante un proxy configurado en `vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'https://localhost:7036', // puerto del backend .NET
      changeOrigin: true,
      secure: false, // acepta el certificado de desarrollo autofirmado de .NET
    },
  },
}
```

- Esto evita CORS en desarrollo y permite usar el certificado dev de .NET sin instalarlo.
- Si el backend corre en otro puerto, cambia `target`.
- Alternativa sin proxy: definir `VITE_API_URL` (variable leída por `client.ts`) con la URL
  base completa del backend, por ejemplo:

  ```bash
  # .env.local
  VITE_API_URL=https://localhost:7036
  ```

---

## Cambiar de asesor (simulación de identidad A/B)

El enunciado permite simular la identidad en lugar de implementar login.

- La identidad del asesor se envía en el header **`X-Advisor-Id`** (`A` o `B`) en cada
  petición que lo requiere (`POST /api/sales`, `GET /api/sales`). `GET /api/plans` no lo envía.
- En la UI, el conmutador **A / B** de la esquina superior derecha cambia el asesor activo.
- La selección se persiste en `localStorage` (`segura-vida.advisor`), así que sobrevive a
  recargas de página.
- Al cambiar de asesor:
  - La tabla de ventas vuelve a la página 1 y recarga las ventas de ese asesor.
  - El formulario genera una **referencia nueva** y limpia el resultado anterior.

**Límites de la simulación**: la pantalla no autentica realmente; el aislamiento de datos
entre asesores lo garantiza el backend (filtra por el header, no por parámetros). El frontend
confía en esa garantía y no debe considerarse un control de seguridad por sí mismo.

---

## Formato de la referencia de solicitud

Generada en `src/lib/format.ts`:

```
REF-<ASESOR>-<YYYYMMDD>-<4 caracteres aleatorios>
# ejemplo: REF-A-20261008-9DMN
```

La **unicidad se evalúa por asesor en el backend**; A y B pueden usar el mismo texto para
compras distintas. El frontend solo genera un valor nuevo para cada compra nueva (R5) y lo
conserva intacto durante los reintentos.

---

## Mapa de la aplicación (Atomic Design)

```
src/
├── api/
│   ├── client.ts        Cliente HTTP tipado + mapeo de errores de negocio a mensajes
│   ├── hooks.ts         usePlans / useSales / useCreateSale (react-query)
│   ├── queryClient.ts   QueryClient (retries: solo 5xx, no errores de negocio)
│   └── types.ts         Tipos del contrato de la API
├── context/
│   └── AdvisorContext.tsx   Asesor activo (A/B) persistido en localStorage
├── hooks/
│   └── useSaleForm.ts   Lógica del formulario (validación, envío, reintento, nueva venta)
├── lib/
│   └── format.ts        Formato COP/fecha, validación de email, generación de referencia
├── components/
│   ├── atoms/           Button, TextInput, Label, Badge, Spinner, FieldError, LogoMark
│   ├── molecules/       Card, Field, FormField, SectionTitle, Pagination, PlanOption,
│   │                    QuotaBadge, AlertMessage, LoadingState, EmptyState
│   ├── organisms/       Logo, AdvisorSwitch, PlansPanel, SaleForm, SaleSuccess, SalesTable
│   ├── templates/       AppLayout (estructura de página)
│   └── pages/           SalesPage (ensamblaje final)
└── test/                setup y helper de mock de fetch
```

---

## Cobertura de requisitos (R1–R5) desde el frontend

| Req. | Qué hace la UI | Dónde |
| ---- | -------------- | ----- |
| **R1** | Muestra nombre, prima y disponibilidad de ambos planes; botón de recarga. | `organisms/PlansPanel.tsx` |
| **R2** | Selección de plan, nombre/email del comprador y referencia; muestra la venta aceptada. | `organisms/SaleForm.tsx`, `SaleSuccess.tsx` |
| **R3** | Las reglas se resuelven en el backend; la UI muestra el resultado (venta repetida, conflicto, sin cupos) con mensajes claros. Tras una venta exitosa se invalidan planes y ventas para reflejar la disponibilidad. | `api/hooks.ts`, `client.ts` |
| **R4** | Lista las ventas del asesor activo, más recientes primero, paginadas de 20 en 20. | `organisms/SalesTable.tsx` |
| **R5** | Estados de "enviando", éxito y errores comprensibles. Si falla, permite **reintentar conservando la misma referencia y datos**. "Nueva venta" usa una referencia nueva. | `hooks/useSaleForm.ts`, `SaleForm.tsx` |

El bloqueo del botón de envío durante la petición es solo UX; **no sustituye** las reglas del
backend, que son la fuente de verdad.

---

## Pruebas automatizadas

Framework: **Vitest** + **Testing Library** (`jsdom`). Configuración en `vitest.config.ts` y
`src/test/setup.ts`.

```bash
npm test            # ejecuta toda la suite una vez
npm run test:watch  # modo watch
npm run test:coverage
```

**Estado actual: 3 archivos de prueba, 32 pruebas, todas en verde.**

### Qué se cubre

- **`src/api/client.test.ts`** (un bloque por endpoint, con `fetch` mockeado):
  - **R1 `GET /api/plans`**: respuesta 200; verifica que NO envía `X-Advisor-Id`.
  - **R2/R3 `POST /api/sales`**: envía POST + header + cuerpo JSON y devuelve la venta (201);
    repetición idempotente; y los errores del contrato: `REFERENCE_CONFLICT`,
    `NO_QUOTA_AVAILABLE`, `INVALID_SALE_DATA`, `PLAN_NOT_FOUND`, `CONCURRENCY_CONFLICT`,
    `UNAUTHORIZED_ADVISOR` (401 sin cuerpo) y propagación de error de red.
  - **R4 `GET /api/sales`**: arma la query `page`/`pageSize` (default 20 y personalizado),
    envía el header del asesor activo (aislamiento A/B) y maneja `UNAUTHORIZED_ADVISOR`.
- **`src/hooks/useSaleForm.test.tsx`** (comportamiento exigido por el enunciado para React):
  envío exitoso, error de negocio, **reintento con la misma referencia** y **nueva venta con
  referencia nueva**, además de la validación que bloquea envíos inválidos.
- **`src/lib/format.test.ts`**: formato COP/fecha, validación de email y el **formato de
  referencia por asesor** (único entre llamadas).

### Pruebas priorizadas y por qué

Dentro del tiempo disponible se priorizó la **capa de API** (contrato con el backend) y la
**lógica del formulario** (`useSaleForm`), porque concentran las reglas que el enunciado pide
comprobar en React —envío, error y reintento con referencia— y porque son deterministas (no
dependen del render ni de estilos). Se extrajo la lógica del formulario a un hook precisamente
para poder probarla aislada de la vista.

### Pendiente / no cubierto por tiempo

- Pruebas de render de organismos (p. ej. que `SaleForm` muestre en pantalla el botón
  "Reintentar"), que hoy están cubiertas a nivel de hook pero no de DOM.
- Prueba de integración de `SalesTable` (paginación navegando entre páginas en el DOM).
- La comprobación de **carga de 10.000 ventas** y las **10 consultas simultáneas** es
  responsabilidad del backend; desde el frontend se verificó manualmente (ver abajo).

---

## Comprobaciones realmente obtenidas

Verificaciones ejecutadas contra el backend real a través del proxy de Vite:

- **R1** — `GET /api/plans` devolvió:
  `[{ACC_ESENCIAL, premium 50000, availableQuota 0}, {ACC_PLUS, premium 90000, availableQuota 5}]`.
  (`ACC_ESENCIAL` aparecía ya en 0 porque su único cupo se había consumido en el backend.)
- **R4** — `GET /api/sales` con `X-Advisor-Id: A` devolvió 20 ventas (más recientes primero),
  `totalCount: 5001`, `totalPages: 251`, confirmando que la carga de historial repartida entre
  A y B está presente y que la paginación funciona.
- **Proxy/header** — el header `X-Advisor-Id` llega correctamente al backend a través del proxy;
  el intento directo por HTTPS desde PowerShell 5.1 falla por la negociación TLS del script, no
  por el proxy (que sí entrega la respuesta).
- **Build/lint/test** — `npm run build`, `npm run lint` y `npm test` pasan sin errores.

> Nota: al reiniciar el backend (almacenamiento en memoria) la disponibilidad vuelve al estado
> inicial, lo que permite volver a probar una venta exitosa de `ACC_ESENCIAL`.

---

## Decisiones importantes

**react-query para el estado de servidor.**
Contexto: la pantalla depende casi por completo de datos remotos (planes, ventas, mutación de
venta). Alternativas: `useEffect` + `useState` manual, o SWR. Elección: `@tanstack/react-query`
porque da caché, estados `isLoading/isError/isFetching`, invalidación declarativa y control fino
de reintentos sin código repetitivo. Costo/riesgo: una dependencia más y una curva de
aprendizaje. Comprobación: la invalidación de `plans` + `sales` tras una venta exitosa refresca
la disponibilidad y el listado. Cambiaría la elección si el proyecto no tuviera estado de
servidor relevante.

**Reintentos que respetan la semántica del negocio.**
El `QueryClient` reintenta solo fallos de red/5xx y **nunca** errores de negocio 4xx (sin cupos,
conflicto de referencia, etc.). Razón: reintentar un `409` o `400` no cambiaría el resultado y
podría confundir. El reintento de una venta tras un error de red se hace **con la misma
referencia** para apoyarse en la idempotencia del backend (R5).

**Lógica fuera de la vista (`useSaleForm`).**
Se extrajo la lógica del formulario a un hook para poder probarla sin montar el DOM y para
mantener el organismo `SaleForm` declarativo. Costo: un archivo más; beneficio: pruebas
deterministas de la regla R5.

**Atomic Design.**
Se reorganizó en atoms/molecules/organisms/templates/pages. Beneficio: componentes pequeños y
reutilizables, lógica de datos concentrada en organismos. Costo: más archivos y más imports.

**Tema pastel con Tailwind v4.**
El enunciado no exige diseño elaborado; se eligió un tema claro pastel por legibilidad y rapidez
usando el plugin oficial de Tailwind para Vite.

**Relación frontend / backend / almacenamiento.**
El frontend es sin estado de dominio: no guarda ventas ni cupos. Toda la verdad vive en el
backend (almacenamiento en memoria del prototipo). El frontend solo cachea respuestas en memoria
vía react-query y persiste **únicamente** el asesor activo en `localStorage`. Las garantías R3
(idempotencia, no sobreventa, conflicto de referencia) se cumplen en el backend; el frontend las
refleja y nunca las sustituye.

---

## Dudas / supuestos reversibles

No se obtuvo respuesta del entrevistador durante la construcción, de modo que se asumieron
supuestos reversibles de bajo impacto:

- **Formato de la referencia**: el enunciado pide definirlo. Se eligió
  `REF-<ASESOR>-<YYYYMMDD>-<rand4>`. Reversible: cambiar la función `generateReference` no afecta
  al contrato (el backend solo exige unicidad por asesor).
- **Puerto del backend**: se asumió `https://localhost:7036`. Reversible vía `vite.config.ts` o
  `VITE_API_URL`.
- **Validaciones de cliente** (nombre ≥ 2 caracteres, email con formato básico): son una ayuda de
  UX; la validación autoritativa es del backend (`INVALID_SALE_DATA`). Reversible sin afectar
  reglas del enunciado.

---

## Hipótesis verificada (no se forzó ningún incidente)

**Hipótesis**: tras registrar una venta de un plan con un solo cupo, la disponibilidad mostrada
debe pasar a "Sin cupos" sin recargar la página manualmente, gracias a la invalidación de
react-query.

**Experimento**: `useCreateSale` invalida las queries `plans` y `sales` en `onSuccess`. Se
comprobó en los datos reales que `ACC_ESENCIAL` figuraba con `availableQuota: 0` tras consumirse
su cupo, y la UI de `PlansPanel` renderiza el badge "Sin cupos" para `quota <= 0`. Resultado:
coherente con la hipótesis; la disponibilidad visible se actualiza desde la respuesta del
backend sin recarga manual. No apareció un defecto en este flujo.

---

## Registro de uso de IA

- **Herramienta**: asistente de IA integrado en el IDE (Kiro).
- **Tareas asistidas**: scaffolding del cliente de API y hooks de react-query; componentes de la
  UI; reorganización a Atomic Design; configuración de Vitest y redacción de las pruebas;
  configuración del proxy; redacción de este README.
- **Archivos afectados**: todo `src/` (api, components, context, hooks, lib, test),
  `vite.config.ts`, `vitest.config.ts`, `package.json`, `index.css`, `index.html`, `README.md`.
- **Resumen de instrucciones**: construir un frontend moderno con react-query según el contrato
  de endpoints del enunciado; aplicar tema pastel y logo; reorganizar con Atomic Design; añadir
  pruebas por endpoint; conectar al backend en el puerto indicado.
- **Validación**: cada cambio se verificó con `npm run build`, `npm run lint`, `npm test` y con
  peticiones reales al backend a través del proxy. Un assert demasiado estricto en las pruebas de
  `getPlans` se detectó al correr la suite y se corrigió.
- **Resultados descartados/corregidos**: se descartó un assert inválido sobre el `method` del GET;
  se migraron dos efectos (`useEffect` con `setState`) a derivación en render para eliminar un
  warning de lint.
- **Protección de datos**: no se usaron secretos, credenciales ni datos reales de clientes. Los
  nombres/emails de ejemplo son ficticios. No se envió información sensible a la herramienta.

---

## Límites de la solución

- Solo frontend; requiere el backend corriendo para funcionar.
- Sin autenticación real (identidad A/B simulada por header).
- Sin pruebas E2E ni de render de DOM (cubierto a nivel de API y lógica).
- El tema visual es intencionalmente simple (el enunciado no exige diseño elaborado).
