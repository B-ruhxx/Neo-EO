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

En la primera terminal, ingresa a la carpeta `backend/` y ejecuta:

```bash
cd backend
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

---

## 🧪 Pruebas Automatizadas del Backend

Para ejecutar la suite de pruebas unitarias y de integración (40 pruebas con 100% de éxito):

```bash
cd backend
mvn test
```

- **Ejecutar prueba unitaria específica:** `mvn test -Dtest=TransactionServiceTest`
- **Ruta de reportes de salida:** `backend/target/surefire-reports/`

---

## 📚 Documentación Técnica Detallada

Encuentra toda la documentación de ingeniería de software en la carpeta `docs/`:

- [**Guía Rápida de Servicios, Base de Datos, Swagger y Pruebas**](file:///home/Bruhxx/Documents/neobank_/docs/GUIA_SERVICIOS_TESTS_Y_RUTAS.md)
- [**Documentación Integral de APIs, RF y Casos de Uso**](file:///home/Bruhxx/Documents/neobank_/docs/DOCUMENTACION_SISTEMA_BACKEND_APIS.md)
- [**Arquitectura del Backend, Estructura y Base de Datos**](file:///home/Bruhxx/Documents/neobank_/docs/ARQUITECTURA_Y_ESTRUCTURA_BACKEND.md)
- [**Versión Web Interactiva de Diagramas (Mermaid.js)**](file:///home/Bruhxx/Documents/neobank_/docs/DOCUMENTACION_SISTEMA_BACKEND_APIS.html)

