# 🖥️ FNA Agendamiento Frontend - Sistema de Gestión de Citas 📅

Frontend del sistema de agendamiento de citas del FNA, desarrollado con **Next.js 15** y **React 19** utilizando el App Router. La arquitectura está organizada por features manteniendo una separación clara entre componentes de UI, lógica de negocio, hooks personalizados y capa de servicios para facilitar la escalabilidad y el mantenimiento.

## 🛠️ Stack Tecnológico

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-0EA5E9?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-2563EB?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-0D9488?style=for-the-badge&logo=tailwindcss&logoColor=white)

## ✨ Funcionalidades Principales

- 📅 **Agendamiento de Citas:** Permite seleccionar fecha, hora, sede y tipo de trámite.
- 👤 **Autenticación de Afiliados:** Login y gestión de sesión mediante Next Auth.
- 📋 **Historial de Citas:** Consulta y seguimiento del estado de las citas.
- 🔔 **Notificaciones:** Confirmaciones y recordatorios de citas agendadas.
- 📱 **Diseño Responsivo:** Interfaz adaptada para móviles, tabletas y escritorio.
- 🏗️ **Arquitectura Escalable:** Separación por features con componentes reutilizables y hooks personalizados.

## 🏗️ Arquitectura del Proyecto

El frontend sigue una estructura organizada por features y capas de responsabilidad:

### App Layer (Next.js App Router)
Contiene las páginas y rutas organizadas por grupos:
- **Rutas públicas:** login.
- **Rutas protegidas (dashboard):** citas, auditoria y administración.
- **Layouts anidados** por contexto de navegación.

### Components
Componentes organizados en tres niveles:
- **`ui/`:** Componentes base reutilizables (Button, Input, Card, Modal).
- **`layout/`:** Estructura visual (Navbar, Sidebar, Footer).
- **`citas/`:** Componentes específicos del dominio (CalendarioCitas).

### Hooks & Store
Lógica de negocio desacoplada de la UI:
- **`hooks/`:** Custom hooks para autenticación, citas y formularios.
- **`store/`:** Estado global con Zustand (sesión, citas activas).

### Lib & Types
Infraestructura compartida:
- **`lib/axios.ts`:** Instancia configurada con interceptores y manejo de errores.
- **`lib/validations/`:** Esquemas Zod para todos los formularios.
- **`types/`:** Tipos TypeScript globales del dominio.

## 🏗️ Estructura del Proyecto
```
fna-agendamiento-frontend/
│
├── src/
│   ├── app/                              # App Router de Next.js
│   │   ├── (auth)/                       # Grupo: rutas públicas de autenticación
│   │   │   └── login/
│   │   │       └── page.tsx              # Página de inicio de sesión
│   │   ├── (dashboard)/                  # Grupo: rutas protegidas
│   │   │   ├── citas/
│   │   │   │   ├── page.tsx              # Listado de citas del afiliado
│   │   │   │   └── nueva/
│   │   │   │       └── page.tsx          # Agendar nueva cita
│   │   ├── layout.tsx                    # Layout raíz
│   │   ├── page.tsx                      # Página de inicio
│   │   └── globals.css                   # Estilos globales + Tailwind
│   │
│   ├── components/
│   │   ├── ui/                           # Button, Input, Card, Modal...
│   │   ├── layout/                       # Navbar, Sidebar, Footer
│   │   └── citas/                        # CalendarioCitas
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                    # Hook de autenticación
│   │   └── useCitas.ts                   # Hook de gestión de citas
│   │
│   ├── lib/
│   │   ├── utils.ts                      # Utilidades (cn, helpers)
│   │   ├── axios.ts                      # Instancia configurada de Axios
│   │   └── validations/                  # Esquemas de validación con Zod
│   │
│   ├── store/
│   │   └── authStore.ts                  # Estado global con Zustand
│   │
│   └── types/
│       ├── cita.ts                       # Tipos del dominio Citas
│       └── usuario.ts                    # Tipos del dominio Usuarios
│
├── public/                               # Archivos estáticos
├── .env.local.example                    # Plantilla de variables de entorno
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

## 🚦 Guía de Inicio Rápido

### Requisitos

- Node.js 18+
- npm 9+

## 📦 Instalación

### 1️⃣ Clonar repositorio
```bash
git clone https://github.com/CerebiiaCompany/fna-agendamiento-frontend.git
cd fna-agendamiento-frontend
```

### 2️⃣ Instalar dependencias
```bash
npm install
```


### 3️⃣ Ejecutar servidor de desarrollo
```bash
npm run dev
```

Servidor disponible en:
```
http://localhost:3000
```
