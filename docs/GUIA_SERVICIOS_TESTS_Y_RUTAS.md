# 🚀 NeoBank — Guía Rápida de Servicios, Base de Datos, Swagger y Pruebas

Esta guía contiene las URLs oficiales del sistema, parámetros de conexión a la base de datos, acceso a Swagger para probar las APIs, comandos para correr pruebas unitarias y la ruta exacta donde se guardan los reportes de resultados.

---

## 🗄️ 1. Base de Datos H2 (Consola Web y Conexión)

El backend de NeoBank utiliza **H2 Database Engine** en modo archivo persistente en disco (`./data/testdb.mv.db`).

### Acceso a la Consola Web de H2:
- **URL en el navegador:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

### Parámetros de Conexión (Login):

| Campo en Pantalla | Valor que debes colocar |
|---|---|
| **Configuraciones guardadas:** | `Generic H2 (Embedded)` |
| **Controlador (Driver Class):** | `org.h2.Driver` |
| **URL JDBC:** | `jdbc:h2:file:./data/testdb` |
| **Nombre de usuario (User Name):** | `sa` |
| **Contraseña (Password):** | *(dejar completamente vacío / en blanco)* |

> [!TIP]
> Haz clic en **"Probar la conexión"** para confirmar y luego en **"Conectar"**.

### Ubicación del archivo físico en disco:
```text
backend/data/testdb.mv.db
```

### Usuarios preconfigurados en la base de datos:
- **Administrador:** `admin@bank.com` | Contraseña: `admin123` (Acceso a `/admin`)
- **Cliente Demo:** `demo@bank.com` | Contraseña: `demo123` (Acceso a `/dashboard`)

---

## 📑 2. Swagger / OpenAPI (Pruebas Visuales de la API)

SpringDoc OpenAPI expone una interfaz gráfica interactiva para probar todos los endpoints REST con documentación de esquemas y modelos JSON.

- **URL interactiva de Swagger UI:** [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **URL del contrato OpenAPI (JSON):** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Cómo probar endpoints protegidos con JWT en Swagger:
1. En Swagger, busca el bloque **`auth-controller`** y ejecuta `POST /api/auth/login` con:
   ```json
   {
     "email": "demo@bank.com",
     "password": "demo123"
   }
   ```
2. Copia la cadena del `token` recibido en la respuesta.
3. Arriba a la derecha, presiona el botón verde **"Authorize"** 🔓.
4. Pega el token en el campo `bearerAuth` y haz clic en **Authorize**.
5. Ahora todos los endpoints de tarjetas, préstamos, bóvedas y transferencias se ejecutarán con autorización válida.

---

## ☕ 3. Comandos para Ejecutar las Pruebas del Backend

Todas las pruebas se ejecutan desde la carpeta `backend/` usando Maven:

```bash
cd backend
```

### A. Ejecutar TODAS las pruebas del backend:
```bash
mvn test
```
*(O si usas el wrapper: `./mvnw test`)*

---

### B. Ejecutar una Prueba Unitaria o Clase Específica:
Utiliza el parámetro `-Dtest=<NombreDeLaClase>`:

```bash
mvn test -Dtest=TransactionServiceTest
```

#### Catálogo de pruebas unitarias disponibles en el proyecto:

| Módulo a Probar | Comando Maven | ¿Qué valida? |
|---|---|---|
| **Transacciones Financieras** | `mvn test -Dtest=TransactionServiceTest` | Depósitos, retiros, transferencias atómicas y validación de saldo. |
| **Autenticación y Registro** | `mvn test -Dtest=AuthServiceTests` | Creación de usuarios, login con BCrypt y generación de tokens. |
| **Seguridad y Roles** | `mvn test -Dtest=AuthControllerSecurityTests` | Restricción de roles (`ADMIN` vs `USER`) mediante `@WithMockUser`. |
| **Tarjetas Virtuales** | `mvn test -Dtest=VirtualCardTests` | Asignación de límites, cambio de PIN, regeneración y bloqueo. |
| **Panel de Administración** | `mvn test -Dtest=AdminServiceTests` | Ajustes contables de saldo, cálculo de KPIs y métricas. |
| **Recuperación de Contraseña**| `mvn test -Dtest=PasswordResetServiceTests` | Generación y canje de tokens criptográficos de un solo uso. |
| **Operaciones de Usuario** | `mvn test -Dtest=UserImplementationTests` | CRUD completo y actualización de datos de perfil. |
| **Borrado Lógico** | `mvn test -Dtest=UserServiceSoftDeleteTests` | Eliminación lógica de cuentas (`deleted = true`). |
| **Centro de Notificaciones** | `mvn test -Dtest=NotificationServiceTest` | Creación automática de alertas financieras y marcado de lectura. |
| **Arranque de Contexto** | `mvn test -Dtest=BackendApplicationTests` | Carga íntegra de beans de Spring Boot en memoria aislada. |

---

### C. Ejecutar un solo Método de Prueba:
```bash
mvn test -Dtest=TransactionServiceTest#testDepositIncreasesBalance
```

---

## 📁 4. Ruta Donde Sale el Resultado de las Pruebas

Al finalizar la ejecución de Maven Surefire Plugin, los resultados se escriben automáticamente en:

```text
backend/target/surefire-reports/
```

### Tipos de archivos generados por prueba:

1. **Reporte en texto plano (.txt) — Para lectura humana rápida:**
   - Ejemplo: `backend/target/surefire-reports/com.neobank.backend.TransactionServiceTest.txt`
   - Contenido: Resumen de pruebas ejecutadas, fallos, errores, tiempo transcurrido y traza de error en caso de fallo.

2. **Reporte en formato XML (.xml) — Para herramientas CI/CD o plugins:**
   - Ejemplo: `backend/target/surefire-reports/TEST-com.neobank.backend.TransactionServiceTest.xml`
   - Contenido: Estructura estándar JUnit XML para Jenkins, GitHub Actions o GitLab CI.

### Comando rápido para consultar el reporte en terminal:
```bash
cat backend/target/surefire-reports/com.neobank.backend.TransactionServiceTest.txt
```

O para ver el resumen de todas las pruebas ejecutadas:
```bash
cat backend/target/surefire-reports/*.txt | grep -E "Tests run:|FAILURE|ERROR"
```

---

*Guía generada para el equipo de desarrollo de NeoBank.*
