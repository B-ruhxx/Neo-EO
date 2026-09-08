# 🏦 NeoBank — Plataforma Bancaria Digital

Guía rápida para iniciar y ejecutar el proyecto localmente (Backend en Spring Boot y Frontend en React).

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema:
- **Java 17** o superior (`java -version`)
- **Maven** (`mvn -v`) o utilizar el wrapper `./mvnw`
- **Node.js 18+** y **npm** (`node -v`, `npm -v`)

---

## 🚀 Cómo Iniciar el Proyecto

El proyecto requiere dos terminales (una para el servidor backend y otra para la interfaz web frontend).

### 1. Iniciar el Backend (Spring Boot)

En la raíz del proyecto, abre una terminal y ejecuta:

```bash
mvn spring-boot:run
```
*(O si usas el wrapper de Maven en Linux/macOS: `./mvnw spring-boot:run`)*

- **Servidor API**: [http://localhost:8080](http://localhost:8080)
- **Documentación Swagger / OpenAPI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Consola de Base de Datos H2**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - **JDBC URL**: `jdbc:h2:file:./data/testdb`
  - **User Name**: `sa`
  - **Password**: *(dejar en blanco)*

---

### 2. Iniciar el Frontend (React)

En una segunda terminal, ingresa a la carpeta `frontend/`:

```bash
cd frontend
npm install
npm start
```

- **Aplicación Web**: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Cuentas de Acceso Preconfiguradas

La base de datos cuenta con dos perfiles listos para probar la plataforma:

| Rol | Correo Electrónico | Contraseña | Acceso / Funcionalidades |
|---|---|---|---|
| **Administrador** | `admin@bank.com` | `admin123` | Consola `/admin` (usuarios, auditoría, base de datos y métricas globales) |
| **Cliente Demo** | `demo@bank.com` | `demo123` | Portal `/dashboard` (cuentas, tarjetas virtuales, bóvedas y transferencias) |

*(También puedes registrar nuevos usuarios en `/register` desde la aplicación)*.
