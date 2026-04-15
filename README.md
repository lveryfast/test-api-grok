# Grok Video API Test

Interfaz de prueba para la API de video de Grok con continuidad de escenas mediante screenshots automáticos.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Flujo de Generación Automática](#flujo-de-generación-automática)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Routes](#api-routes)
- [Logs](#logs)
- [Desarrollo](#desarrollo)

---

## Requisitos

### Frontend (Next.js)
- Node.js >= 18.0.0
- npm o yarn

### Screenshot Extractor (Python + FFmpeg)
- Python 3.8+
- FFmpeg

### Verificar instalación de FFmpeg

```bash
ffmpeg -version
```

Si no está instalado:
- **Windows**: `winget install ffmpeg` o descarga desde https://ffmpeg.org/download.html
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd test-api-grok
```

### 2. Instalar dependencias de Node.js

```bash
npm install
```

### 3. Instalar FFmpeg

El screenshot extractor usa FFmpeg para extraer frames de los videos generados.

```bash
# Verificar si está instalado
ffmpeg -version

# Si no está, instalar:
# Windows:
winget install ffmpeg

# macOS:
brew install ffmpeg

# Linux:
sudo apt install ffmpeg
```

**Nota**: No se requiere instalar Python ni dependencias adicionales. El script de Python solo necesita FFmpeg en el PATH del sistema.

---

## Configuración

### 1. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local
```

### 2. Editar `.env.local`

```env
# Clave de API de Grok (obtener en https://console.x.ai/)
GROK_API_KEY=tu_api_key_aqui
```

### Obtener API Key de Grok

1. Ve a https://console.x.ai/
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. Copia la key en tu `.env.local`

---

## Uso

### 1. Iniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Abrir en el navegador

```
http://localhost:3000
```

### 3. Flujo de Trabajo

1. **Guión**: Ingresa o pega el guión del video
2. **Estilo**: Selecciona uno de los 12 estilos predefinidos o crea uno custom
3. **Personaje**: Describe las características del personaje
4. **Voz**: Describe las características de la voz
5. **Escenas**: Selecciona el número de escenas (2-14)
6. **Editor de Escenas**: Llena el diálogo y descripción para cada escena
7. **Gancho**: Ingresa el prompt del gancho (primera escena)
8. **Generar**: Revisa el prompt preview y confirma para generar

---

## Flujo de Generación Automática

El programa maneja automáticamente la continuidad visual entre escenas:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERACIÓN AUTOMÁTICA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ESCENA 1                                                        │
│  ├── Usuario ingresa: Guión, Estilo, Personaje, Voz, Gancho     │
│  ├── Programa construye: Prompt completo                        │
│  ├── Usuario confirma: "Enviar a Grok"                          │
│  ├── Grok genera: Video 1 (MP4)                                │
│  ├── FFmpeg extrae: Screenshot del último frame                │
│  └── Programa guarda: screenshot_escena1.png                    │
│                                                                  │
│  ESCENA 2                                                        │
│  ├── Programa toma: screenshot_escena1.png (automático)         │
│  ├── Programa incluye: screenshot en el prompt                   │
│  ├── Usuario confirma: "Enviar a Grok"                          │
│  ├── Grok genera: Video 2 (consistente con screenshot)         │
│  ├── FFmpeg extrae: Screenshot del último frame                │
│  └── Programa guarda: screenshot_escena2.png                    │
│                                                                  │
│  ... continúa hasta escena N                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Verificación de Prompts

Antes de enviar a la API de Grok, puedes:
- ✅ Ver el prompt completo que se enviará
- ✅ Ver si incluye screenshot de la escena anterior
- ✅ Copiar el prompt para revisarlo
- ✅ Confirmar para proceder con la generación

---

## Estructura del Proyecto

```
test-api-grok/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── grok/video/       # Endpoint de generación de video
│   │   │   ├── logs/             # Endpoint de logs
│   │   │   ├── screenshot/       # Endpoint de screenshots
│   │   │   └── health/           # Health check
│   │   ├── page.tsx             # Página principal
│   │   ├── layout.tsx           # Layout principal
│   │   └── globals.css          # Estilos globales
│   │
│   ├── components/
│   │   ├── ui/                  # Componentes base (shadcn/ui)
│   │   ├── sections/            # Secciones del formulario
│   │   └── video/               # Componentes de video
│   │
│   ├── hooks/
│   │   └── useVideoStore.ts     # Estado global (Zustand)
│   │
│   ├── lib/
│   │   ├── grok-client.ts       # Cliente de API de Grok
│   │   ├── api-logger.ts        # Sistema de logs
│   │   ├── prompt-builder.ts    # Constructor de prompts
│   │   └── utils.ts             # Utilidades
│   │
│   └── types/
│       ├── video.ts             # Tipos de video
│       ├── style.ts             # Tipos de estilos
│       ├── scene.ts             # Tipos de escena
│       ├── api.ts               # Tipos de API
│       └── constants.ts         # Constantes y límites
│
├── python/
│   ├── screenshot/
│   │   ├── extract_frame.py     # Script de extracción de frames (FFmpeg)
│   │   └── requirements.txt     # Dependencias de Python (moviepy)
│   └── logs/                    # Logs de API (git ignored)
│       └── api_calls.log        # Archivo de logs de llamadas
│
├── .env.example                 # Template de variables
├── .env.local                  # Variables locales (git ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts
```

---

## API Routes

### POST /api/grok/video

Genera un video usando la API de Grok.

**Request:**
```json
{
  "prompt": "string",
  "image": "string (opcional)",
  "sceneNumber": 1
}
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://...",
  "tokens": 150,
  "cost": 0.0015
}
```

### POST /api/screenshot

Extrae un screenshot de un video usando FFmpeg.

**Request:**
```json
{
  "videoPath": "/path/to/video.mp4",
  "timestamp": null
}
```

**Response:**
```json
{
  "success": true,
  "screenshotPath": "/path/to/screenshot.png"
}
```

### GET /api/logs

Obtiene todos los logs de llamadas a la API.

### POST /api/logs

Guarda un nuevo log entry.

### DELETE /api/logs

Limpia todos los logs.

---

## Logs

Los logs de llamadas a la API se guardan automáticamente en:

```
python/logs/api_calls.log
```

Formato de cada línea (JSON):
```json
{
  "id": "log_123456_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "sceneNumber": 1,
  "request": {
    "prompt": "...",
    "hasImage": true
  },
  "response": {
    "success": true,
    "videoUrl": "https://..."
  },
  "duration": 12500
}
```

---

## Límites de Caracteres (Optimizados Costo-Beneficio)

Límites diseñados para minimizar costos de API manteniendo calidad:

| Campo | Límite | Tokens aprox. |
|-------|--------|---------------|
| Guión | 5,000 | ~1,250 |
| Personaje | 500 | ~125 |
| Voz | 300 | ~75 |
| Diálogo por escena | 200 | ~50 |
| Descripción por escena | 300 | ~75 |
| Estilo personalizado | 150 | ~37 |

---

## Estilos Disponibles

1. **Estilo Pixar** - Modelado 3D limpio y suave
2. **Estilo Studio Ghibli** - Estética nostálgica y poética
3. **Estilo DreamWorks** - Render 3D cinematográfico
4. **Estilo Tejido** - Apariencia de crochet/amigurumi
5. **Estilo Marvel** - Ilustración tipo cómic cinematográfico
6. **Estilo Anime Chibi** - Proporciones exageradas kawaii
7. **Estilo Plastilina** - Claymation/stop-motion
8. **Estilo Cartoon** - Caricaturesco expresivo
9. **Estilo Minecraft** - Estética voxel
10. **Estilo Dibujo a Lápiz** - Boceto realista
11. **Estilo Realista** - Fotorealismo
12. **Estilo Objeto Animado** - Personaje 3D hiperrealista

---

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción

# Testing
npm run test             # Ejecutar tests
npm run test:watch       # Ejecutar tests en watch mode
npm run test:coverage    # Generar reporte de cobertura

# Linting
npm run lint             # Verificar código
```

### Testing

```bash
npm run test
```

## Tests (79 tests totales)

Este proyecto tiene una suite completa de tests organizados en tests unitarios y de integración.

### Resumen de Cobertura

| Categoría | Archivo | Tests |
|-----------|---------|-------|
| **Unitarios** | constants.test.ts | 16 |
| | scene.test.ts | 9 |
| | prompt-builder.test.ts | 16 |
| | api-logger.test.ts | 4 |
| | grok-client.test.ts | 1 |
| | rate-limiter.test.ts | 14 |
| **Integración** | grok-video.test.ts | 19 |
| **Total** | | **79** |

---

### Tests Unitarios

#### constants.test.ts (16 tests)
Verifica las constantes y configuraciones del sistema.

| Test | Descripción |
|------|-------------|
| `should have correct cost-efficient limits defined` | Verifica que los límites de caracteres estén correctamente definidos (5000 guión, 500 personaje, etc.) |
| `should have all required fields` | Confirma que CHARACTER_LIMITS tiene todas las propiedades requeridas |
| `should have reasonable values` | Verifica que todos los límites sean valores positivos |
| `should have script with highest limit` | Confirma que el guión tiene el límite más alto |
| `should have exactly 12 predefined styles` | Verifica que hay exactamente 12 estilos de video predefinidos |
| `should have all required style properties` | Confirma que cada estilo tiene id, title, description, isCustom |
| `should all be non-custom styles` | Verifica que los estilos predefinidos no sean custom |
| `should have unique IDs` | Confirma que no hay IDs duplicados entre estilos |
| `should have non-empty titles and descriptions` | Verifica que todos los estilos tengan títulos y descripciones |
| `should include expected styles` | Confirma que estilos específicos (pixar, ghibli, etc.) están incluidos |
| `should have correct SCENE_COUNTS values` | Verifica que las opciones de escenas sean [2, 4, 6, 8, 10, 12, 14] |
| `should have 7 options` | Confirma que hay 7 opciones de cantidad de escenas |
| `should be even numbers` | Verifica que todas las opciones sean números pares |
| `should start with minimum of 2` | Confirma que el mínimo es 2 escenas |
| `should end with maximum of 14` | Confirma que el máximo es 14 escenas |
| `should have consistent increments` | Verifica que los incrementos sean consistentes (de 2 en 2) |

#### scene.test.ts (9 tests)
Prueba la creación y validación de escenas.

| Test | Descripción |
|------|-------------|
| `should create scene with correct id` | Verifica que `createEmptyScene(5)` cree una escena con id=5 |
| `should create scene with empty dialogue` | Confirma que el diálogo inicial está vacío |
| `should create scene with empty description` | Confirma que la descripción inicial está vacía |
| `should return valid for complete scene` | Verifica que una escena con diálogo y descripción sea válida |
| `should return error for empty dialogue` | Confirma que falten diálogos retorna error "El diálogo es requerido" |
| `should return error for empty description` | Confirma que falte descripción retorna error "La descripción de escena es requerida" |
| `should return error for whitespace-only dialogue` | Verifica que espacios en blanco no counts como válido |
| `should return error for whitespace-only description` | Verifica que espacios en blanco no counts como válido |
| `should return multiple errors for multiple issues` | Confirma que se retornan múltiples errores cuando hay varios problemas |

#### prompt-builder.test.ts (16 tests)
Verifica la construcción de prompts para la API de Grok.

| Test | Descripción |
|------|-------------|
| `should build prompt with all components for first scene` | Verifica que el prompt incluya: GANCHO, guión, estilo, personaje, voz, escena |
| `should include continuity instructions for scenes after first` | Confirma que escenas posteriores incluyan instrucciones de CONTINUIDAD |
| `should not include character if empty` | Verifica que no se incluya PERSONAJE si está vacío |
| `should not include voice if empty` | Verifica que no se incluya VOZ si está vacío |
| `should estimate tokens correctly` | Confirma que `estimateTokens('a'*100)` retorne 25 |
| `should round up to nearest integer` | Verifica redondeo hacia arriba (101/4 = 26) |
| `should return 0 for empty string` | Confirma que string vacío = 0 tokens |
| `should return valid for complete components` | Verifica que componentes completos sean válidos |
| `should return error if script is empty` | Confirma error cuando guión está vacío |
| `should return error if dialogue is empty` | Confirma error cuando diálogo está vacío |
| `should return error if description is empty` | Confirma error cuando descripción está vacía |
| `should return error if hook is empty for first scene` | Confirma que el gancho es requerido solo para escena 1 |
| `should not require hook for scenes after first` | Confirma que escena 2+ no requiere gancho |
| `should return multiple errors for multiple missing fields` | Verifica errores acumulativos |
| `should show truncated dialogue` | Confirma que preview muestre diálogo truncado con "..." |
| `should indicate when screenshot is included` | Verifica que preview indique "CONTIENE: Imagen de referencia" |

#### api-logger.test.ts (4 tests)
Prueba el sistema de logging de llamadas a la API.

| Test | Descripción |
|------|-------------|
| `should generate unique IDs` | Verifica que `generateLogId()` genere IDs únicos con formato `log_[timestamp]_[random]` |
| `should create a valid log entry` | Confirma estructura correcta del log (id, sceneNumber, request, response, duration) |
| `should set hasImage to true when image is provided` | Verifica que `hasImage` sea true cuando se incluye imagen |
| `should call API endpoint` | Confirma que `saveApiLog` haga fetch a `/api/logs` con método POST |

#### grok-client.test.ts (1 test)
Verifica la existencia y tipo del cliente de Grok.

| Test | Descripción |
|------|-------------|
| `should be defined as a function` | Confirma que `generateVideo` está definida como función |

#### rate-limiter.test.ts (14 tests)
Prueba el sistema de rate limiting para proteger las APIs.

| Test | Descripción |
|------|-------------|
| `should allow first request within limit` | Primera request debe ser permitida, remaining = max-1 |
| `should track multiple requests from same client` | Múltiples requests del mismo cliente decrementan remaining |
| `should allow different clients independently` | Cliente diferente tiene su propio contador |
| `should use different configs for different endpoints` | Video API (5/min) y Screenshot API (30/min) son independientes |
| `should reset after window expires` | Después de 1 minuto, el contador se resetea |
| `should extract IP from x-forwarded-for header` | Extrae IP correcta del header x-forwarded-for |
| `should extract IP from x-real-ip header` | Extrae IP del header x-real-ip |
| `should extract IP from cf-connecting-ip header` | Extrae IP del header cf-connecting-ip |
| `should prioritize x-forwarded-for over other headers` | x-forwarded-for tiene prioridad sobre otros headers |
| `should return unknown for missing headers` | Retorna "unknown" si no hay headers de IP |
| `should reset rate limit for specific client` | `resetRateLimit(clientId)` limpia solo ese cliente |
| `should clear all rate limits` | `clearAllRateLimits()` limpia todos los clientes |
| `should have correct video generation limits` | Confirma 5 req/min para video API |
| `should have correct screenshot limits` | Confirma 30 req/min para screenshot API |

---

### Tests de Integración

#### grok-video.test.ts (19 tests)
Prueba el flujo completo de las APIs con mocks de servicios externos.

##### VideoGenerationSchema validation (5 tests)
| Test | Descripción |
|------|-------------|
| `should accept valid prompt` | Prompt válido pasa validación |
| `should reject empty prompt` | Prompt vacío es rechazado |
| `should reject prompt exceeding max length` | Prompt >10000 caracteres es rechazado |
| `should accept optional image field` | Campo image opcional es aceptado |
| `should default sceneNumber to 1 if not provided` | sceneNumber default = 1 |

##### Prompt sanitization (4 tests)
| Test | Descripción |
|------|-------------|
| `should trim whitespace from prompts` | Espacios al inicio/final son eliminados |
| `should remove control characters` | Caracteres de control (\x00, \x1F) son eliminados |
| `should truncate to max length` | Prompts >10000 chars son truncados |
| `should preserve valid unicode characters` | Caracteres Unicode (中文, 🎬) son preservados |

##### Error handling (3 tests)
| Test | Descripción |
|------|-------------|
| `should handle missing API key` | Maneja gracefully cuando GROK_API_KEY está vacío |
| `should handle API timeout with retry` | Retry logic funciona en caso de timeout |
| `should handle malformed JSON response` | Maneja respuestas JSON inválidas |

##### ScreenshotRequestSchema validation (5 tests)
| Test | Descripción |
|------|-------------|
| `should accept valid video path` | URL de video válida es aceptada |
| `should accept local file path` | Ruta local de archivo es aceptada |
| `should reject empty video path` | Path vacío es rechazado |
| `should accept optional timestamp` | Timestamp opcional (incluyendo 0) es aceptado |
| `should reject negative timestamp` | Timestamp negativo es rechazado |

##### API Logger Integration (2 tests)
| Test | Descripción |
|------|-------------|
| `should log successful video generation` | logVideoGeneration no lanza excepciones |
| `should log video generation errors` | logVideoError no lanza excepciones |

---

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# En modo watch (re ejecutan al guardar)
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Agregar Nuevos Componentes UI

Este proyecto usa shadcn/ui. Para agregar nuevos componentes:

```bash
npx shadcn-ui@latest add <component-name>
```

---

## Troubleshooting

### FFmpeg no encontrado

```bash
# Verificar instalación
ffmpeg -version

# Si no está, instalar:
# Windows: winget install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Error al extraer screenshots

1. Verificar que FFmpeg esté instalado: `ffmpeg -version`
2. Verificar que FFmpeg esté en el PATH del sistema
3. Probar el script manualmente:

```bash
python python/screenshot/extract_frame.py input.mp4 output.png
```

---

## Licencia

MIT
