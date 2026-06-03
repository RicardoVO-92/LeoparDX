# Inicio rápido — LeoparDX

Requisitos previos:
- Node.js (recomiendo 18+)
- Firebase CLI (`npm install -g firebase-tools`) opcional
- (Opcional) Angular CLI: `npm install -g @angular/cli`

Pasos para ejecutar después de clonar el repositorio:

1. Entrar al directorio del proyecto:

```bash
cd LeoparDX/LeoparDX
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear el archivo de configuración local (no subir éste al repo):

POSIX:
```bash
cp src/app/enviroment.example.ts src/app/enviroment.ts
```

PowerShell (Windows):
```powershell
Copy-Item src\app\enviroment.example.ts src\app\enviroment.ts
```

Editar `src/app/enviroment.ts` y pegar las credenciales de Firebase (apiKey, authDomain, projectId, etc.).

4. Desarrollo local:

```bash
npm run start
# o
ng serve
```

5. Construir para producción:

```bash
npm run build
```

6. Desplegar a Firebase Hosting:

```bash
firebase login
firebase use --add   # seleccionar proyecto si es la primera vez
firebase deploy --only hosting
```

Notas importantes:
- `src/app/enviroment.ts` contiene tus claves de Firebase; NO lo subas al repositorio. Usa `enviroment.example.ts` como plantilla.
- `.gitignore` ya excluye `node_modules/`, `dist/`, y `src/app/enviroment.ts`.
- Si usas emuladores, ejecuta `firebase emulators:start`.
