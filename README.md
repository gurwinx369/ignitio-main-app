# Ignitio

> **Interactive, gamified learning platform** with structured roadmaps, progress tracking, and engaging milestones. Built with Next.js (App Router), React 19, Tailwind CSS, MongoDB, and Firebase.

---

## 🧭 Architectural Guidelines & Agent Directives

This project adheres strictly to the operational boundaries and architectural principles defined in [`AGENTS.md`](./AGENTS.md). All contributors and AI agents must follow these guidelines.

### 1. Core Directives
- **Preserve Existing Behavior:** Do not alter business logic, user flows, auth mechanisms, or database models unless explicitly requested.
- **Smallest Safe Change:** Keep changes atomic and focused; avoid unrelated file modifications or broad, unnecessary refactors.
- **Security First:** Never commit or hardcode secrets, validate all external inputs, and rigorously verify auth tokens server-side.

### 2. Backend Architecture (Strict Layered Pattern)
Ignitio enforces a strict, decoupled layered architecture for backend endpoints:

$$\text{Routes} \longrightarrow \text{Controllers} \longrightarrow \text{Services} \longrightarrow \text{Repositories} \longrightarrow \text{Database}$$

- **Routes (`app/api/...`):** Strictly responsible for request routing and HTTP method matching. No business logic.
- **Controllers:** Parse and validate HTTP requests, invoke the appropriate services, and shape responses. Controllers must extend `BaseController`.
- **Services:** Contain core business rules and workflows. Framework-agnostic and reusable.
- **Repositories:** Encapsulate database access (Mongoose / MongoDB, Prisma).
- **Validation:** All incoming request payloads (body, query params, path params) must be validated using **Zod**.
- **Error Handling:** Errors must be captured via Sentry. Never allow silent failures.

### 3. Frontend Architecture
- **Feature-Sliced Structure:**
  - `features/`: Domain-specific business logic, feature hooks, and feature components.
  - `components/ui/`: Shared, reusable UI primitives.
  - `layout/`: Top-level and shell layout components.
- **State Immutability:** Enforce immutability across all state updates. Never mutate React state or props directly.
- **UI Safety:** UI enhancements or redesigns must never modify existing API contracts, route paths, or essential data structures.

---

## 🤖 Agent Tooling Matrix

When using specialized AI agents, tasks should be delegated according to their specific responsibilities:

| Agent | Responsibility | When to Invoke |
| :--- | :--- | :--- |
| `planner` | System & migration planning | Large redesigns or risky changes spanning > 3 files |
| `architect` | Architecture & scalability | Data flow design, backend layering, system performance |
| `tdd-guide` | Test-driven implementation | New business logic, core APIs, and scoring rules |
| `security-reviewer` | Red-team security audit | Auth flows, API routes, database queries, secrets review |
| `build-error-resolver` | Build & type remediation | Next.js build issues, hydration mismatches, syntax errors |
| `code-reviewer` | Quality assurance | Clean code review after meaningful implementation changes |

> **Design / Stitch Constraints:** Use visual design assistants (like Stitch) **only** for visual layout and medium-to-large UI redesigns. Always adapt generated output to match the existing codebase conventions and design system.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Frontend & UI:** React 19, Tailwind CSS 4, Class Variance Authority (`cva`)
- **Animation & Visuals:** Framer Motion, GSAP, Lucide Icons
- **Authentication:** Firebase Authentication & Firebase Admin SDK
- **Database & Cache:** MongoDB with Mongoose, Upstash Redis & Rate Limiting
- **Analytics & Observability:** PostHog, Sentry
- **Validation:** Zod
- **Payments:** Razorpay

---

## 📁 Repository Structure

```text
├── app/                  # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Authentication route groups
│   ├── api/              # Layered API endpoints
│   └── ...               # Application routes
├── components/           # Shared UI components
│   └── ui/               # Base design system primitives
├── features/             # Feature-sliced modules (domain components, hooks)
│   ├── onboarding/       # Onboarding workflows
│   └── roadmaps/         # Interactive roadmaps & levels
├── layout/               # Shared page containers, cards, and headers
├── lib/                  # Shared utilities (Firebase client, cn helper)
├── models/               # Mongoose schemas and models
├── dbConfig/             # Database connection setup
└── public/               # Static assets & illustrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB instance or MongoDB Atlas URI
- Firebase project configuration

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory and configure required environment variables:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_service_account_private_key
```

### Development Server

Run the development server (configured on port `5000`):

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

### Available Scripts

- `npm run dev` — Starts the development server on `0.0.0.0:5000` with webpack.
- `npm run build` — Compiles the application for production.
- `npm run start` — Runs the production build on port `5000`.
- `npm run lint` — Runs ESLint to check for code quality and style violations.
