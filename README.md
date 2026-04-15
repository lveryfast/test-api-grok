# Grok Video API Test

Interfaz de prueba para la API de video de Grok con continuidad de escenas mediante screenshots.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Routes](#api-routes)
- [Logs](#logs)
- [Desarrollo](#desarrollo)

## Requisitos

### Frontend (Next.js)
- Node.js >= 18.0.0
- npm o yarn

### Backend (Screenshot Extractor)
- Python 3.8+
- FFmpeg (en PATH del sistema)

### Verificar instalación de FFmpeg

```bash
ffmpeg -version
```

Si no está instalado:
- **Windows**: Descarga desde https://ffmpeg.org/download.html o usa `winget install ffmpeg`
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg` o `sudo yum install ffmpeg`

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

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tu configuración
```

### 4. Configurar Python para screenshots

```bash
# Ir a la carpeta de Python
cd python/screenshot

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

O puedes instalar FFmpeg sin entorno virtual:
```bash
pip install moviepy>=1.0.3
```

### 5. Asegurarse de que FFmpeg esté en el PATH

```bash
# Verificar
ffmpeg -version

# Si no está, agregar al PATH del sistema
```

## Configuración

### Variables de Entorno (.env.local)

```env
# Clave de API de Grok (obtener en https://console.x.ai/)
GROK_API_KEY=tu_api_key_aqui

# URL de la aplicación (para desarrollo local)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Ruta del script de Python para screenshots
SCREENSHOT_SCRIPT_PATH=./python/screenshot/extract_frame.py

# Directorio para logs
LOGS_DIR=./python/logs
```

### Obtener API Key de Grok

1. Ve a https://console.x.ai/
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. Copia la key en tu `.env.local`

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

### 4. Verificación de Prompts

Antes de enviar a la API de Grok, puedes:
- Ver el prompt completo que se enviará
- Copiar el prompt para revisarlo
- Confirmar para proceder con la generación

### 5. Generación de Escenas

- La primera escena usa el gancho como base
- Las escenas siguientes incluyen un screenshot de la escena anterior
- Esto mantiene la continuidad visual entre escenas
- Los logs de cada llamada se guardan automáticamente

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
│   │   ├── extract_frame.py     # Script de extracción de frames
│   │   └── requirements.txt     # Dependencias de Python
│   └── logs/                    # Logs de API (git ignored)
│
├── .env.example                 # Template de variables
├── .env.local                  # Variables locales (git ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── vitest.config.ts
```

## API Routes

### POST /api/grok/video

Genera un video usando la API de Grok.

**Request:**
```json
{
  "prompt": "string",
  "image": "string (opcional, base64 o URL)",
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

Extrae un screenshot de un video.

**Request:**
```json
{
  "videoPath": "/path/to/video.mp4",
  "timestamp": 5.5
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

## Logs

Los logs de llamadas a la API se guardan en:

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
    "videoUrl": "https://...",
    "tokens": 150,
    "cost": 0.0015
  },
  "duration": 12500
}
```

## Límites de Caracteres

Para оптимизации de costos, se aplican los siguientes límites:

| Campo | Límite |
|-------|--------|
| Guión | 5,000 |
| Personaje | 1,000 |
| Voz | 500 |
| Diálogo por escena | 300 |
| Descripción por escena | 400 |
| Estilo personalizado | 200 |

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

### Agregar Nuevos Componentes UI

Este proyecto usa shadcn/ui. Para agregar nuevos componentes:

```bash
npx shadcn-ui@latest add <component-name>
```

## Troubleshooting

### FFmpeg no encontrado

```bash
# Verificar instalación
which ffmpeg  # Linux/macOS
where ffmpeg   # Windows

# Instalar si no existe
# Windows: winget install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt install ffmpeg
```

### Error de Python al extraer screenshots

1. Verificar que FFmpeg esté instalado: `ffmpeg -version`
2. Verificar que Python tenga acceso al PATH de FFmpeg
3. Probar el script manualmente:

```bash
python python/screenshot/extract_frame.py input.mp4 output.png
```

### Error de CORS en desarrollo

Asegúrate de que `NEXT_PUBLIC_APP_URL` en `.env.local` coincida con `http://localhost:3000`.

## Licencia

MIT
