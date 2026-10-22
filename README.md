# ClinAssist – AI-Powered Healthcare Decision-Support Platform

ClinAssist is a modern, enterprise-grade clinical decision-support application built with a **Spring Boot 3 + Java 21** backend, a **React 18 + TypeScript + Vite** frontend, a deterministic **Clinical Rule Engine**, and **Google Gemini AI** integration.

---

## 📁 Project Architecture

The repository is organized into a clean, decoupled monorepo structure:

```text
ClinAssist/
├── backend/                             # Dedicated Spring Boot 3 + Java 21 Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/clinassist/     # Controllers, Services, Repositories, Security, Engine
│   │   │   └── resources/               # application.properties (externalized configs)
│   │   └── test/                        # Comprehensive unit and integration test suite
│   ├── .mvn/wrapper/                    # Maven wrapper configuration
│   ├── Dockerfile                       # Multi-stage Alpine Docker build for production
│   ├── mvnw & mvnw.cmd                  # Cross-platform Maven wrapper scripts
│   └── pom.xml                          # Maven build specifications and dependencies
│
├── frontend/                            # Dedicated React + TypeScript + Vite Frontend
│   ├── public/                          # Static assets and icons
│   ├── src/
│   │   ├── components/                  # Reusable UI components
│   │   ├── layouts/                     # Dashboard and app layout wrappers
│   │   ├── pages/                       # Route pages (Patients, Assessment, Users, etc.)
│   │   ├── services/                    # Axios/fetch API clients with JWT injection
│   │   └── types/                       # TypeScript interfaces and data models
│   ├── index.html                       # Single-page application entry HTML
│   ├── package.json                     # Frontend scripts and dependencies
│   ├── tsconfig.json                    # TypeScript compiler configuration
│   └── vite.config.ts                   # Vite bundler and local dev API proxy
│
├── .env.example                         # Environment configuration template (safe placeholders)
├── .gitignore                           # Repository-wide ignore rules (secrets, logs, builds)
└── README.md                            # Comprehensive project guide and deployment manual
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Java 21** JDK (Eclipse Temurin, OpenJDK, or Oracle)
- **Node.js 18+** & npm
- **MongoDB** (Local instance on port 27017 or MongoDB Atlas connection URI)
- **Google Gemini API Key** (from Google AI Studio)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Copy the root environment template or configure environment variables:
   ```bash
   # Linux/macOS
   export MONGODB_URI="mongodb://127.0.0.1:27017/clinassist"
   export JWT_SECRET="your_jwt_secret_key_at_least_256_bits_long_example_ClinAssist2026!"
   export GEMINI_API_KEY="your_actual_gemini_api_key"

   # Windows (PowerShell)
   $env:MONGODB_URI="mongodb://127.0.0.1:27017/clinassist"
   $env:JWT_SECRET="your_jwt_secret_key_at_least_256_bits_long_example_ClinAssist2026!"
   $env:GEMINI_API_KEY="your_actual_gemini_api_key"
   ```

3. Build and launch the Spring Boot application:
   ```bash
   # Using Maven wrapper (Linux/macOS)
   ./mvnw spring-boot:run

   # Using Maven wrapper (Windows)
   .\mvnw.cmd spring-boot:run
   ```

   The backend will start on `http://localhost:8080`. Health status is available at `http://localhost:8080/actuator/health`.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`. During local development, Vite proxies all `/api/*` requests directly to `http://localhost:8080`.

---

---

## ☁️ Deployment Guide on Render

The repository is configured for deployment on **Render** via two options:
- **Option A (Recommended):** Automated 1-Click Blueprint deployment via [`render.yaml`](./render.yaml).
- **Option B:** Manual step-by-step configuration in the Render Dashboard.

---

### Option A: 1-Click Blueprint Deployment (`render.yaml`)

1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** &rarr; **Blueprint**.
3. Connect your GitHub repository (`dharshin15-eng/ClinAssist`).
4. Render will parse [`render.yaml`](./render.yaml) and automatically create:
   - **`clinassist-backend`** (Web Service, Docker runtime, root directory: `backend`)
   - **`clinassist-frontend`** (Static Site, root directory: `frontend`, SPA rewrite rule: `/*` -> `/index.html`)
5. Fill in the requested prompt variables in the dashboard:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `CORS_ALLOWED_ORIGINS`
   - `VITE_API_BASE_URL`
6. Click **Apply**.

---

### Option B: Manual Service Configuration in Render Dashboard

#### Step 1: Deploy Backend Web Service

1. In the Render Dashboard, click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository (`dharshin15-eng/ClinAssist`).
3. Configure the following service settings:
   - **Name:** `clinassist-backend`
   - **Region:** Select the region closest to your MongoDB Atlas cluster (e.g. Frankfurt, Oregon, Singapore)
   - **Branch:** `master`
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free` (or higher)

4. In the **Environment Variables** section, configure:
   | Key | Recommended Value / Notes |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/clinassist?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Secure 256-bit+ random secret (see generation helper below) |
   | `JWT_EXPIRATION_MS` | `86400000` (24 hours) |
   | `GEMINI_API_KEY` | Your Google Gemini API Key from Google AI Studio |
   | `GEMINI_MODEL` | `gemini-3.5-flash-lite` |
   | `GEMINI_TIMEOUT_MS`| `30000` |
   | `CORS_ALLOWED_ORIGINS` | `https://<YOUR-FRONTEND>.onrender.com,http://localhost:5173` |

5. Under **Advanced Settings**, set:
   - **Health Check Path:** `/actuator/health`

6. Click **Deploy Web Service** and note your assigned URL (e.g., `https://clinassist-backend.onrender.com`).

---

#### Step 2: Deploy Frontend Static Site

1. In the Render Dashboard, click **New +** &rarr; **Static Site**.
2. Connect the same repository (`dharshin15-eng/ClinAssist`).
3. Configure the static site settings:
   - **Name:** `clinassist-frontend`
   - **Branch:** `master`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. In the **Environment Variables** section, set:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://clinassist-backend.onrender.com` | Deployed backend URL (without trailing slash) |

5. Under **Redirects and Rewrites**, add the single-page application rewrite:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`

6. Click **Deploy Static Site**.

7. **Final Step:** Copy the published frontend URL (`https://clinassist-frontend.onrender.com`), navigate back to **`clinassist-backend` &rarr; Environment**, and update `CORS_ALLOWED_ORIGINS` to include this frontend URL.

---

## 🗄️ Database & Atlas Network Access

Because Render uses dynamic outbound IP addresses for its services, you must configure MongoDB Atlas to permit connections:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Navigate to **Security** &rarr; **Network Access**.
3. Click **Add IP Address**.
4. Select **Allow Access From Anywhere** (`0.0.0.0/0`) or enter the dedicated outbound IPs if using a paid Render team plan.
5. In **Database Access**, verify that the database user has `readWriteAnyDatabase` or `readWrite@clinassist` privileges.

---

## 🔒 Security Best Practices

- **Never commit `.env` files or secret values:** All sensitive values are externalized via environment variables.
- **Generating a Production JWT Secret:**
  - **Linux / macOS:**
    ```bash
    openssl rand -base64 64
    ```
  - **Windows PowerShell:**
    ```powershell
    [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 } | [byte[]]$_))
    ```
- **RBAC & Token Security:** All protected endpoints require a valid JWT bearer token. Administrative routes are guarded with role-based authorization (`ADMIN`).
- **Audit Logging:** Administrative user actions (creations, deletions, status changes) are recorded in the MongoDB audit log.
