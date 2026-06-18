# 🧠 NeuralNest — AI Tutor

An intelligent, personalized AI learning platform built for Operating Systems (and beyond). NeuralNest adapts to your pace, generates quizzes, tracks your mastery, and lets you chat with an AI tutor grounded in your own syllabus and notes.

---

## ✨ Features

- **AI Tutor Chat** — Conversational tutoring powered by LangGraph + OpenAI, grounded in your uploaded materials via RAG (Pinecone + Cohere)
- **Roadmap** — Visual topic graph showing your mastery progress node by node
- **Quizzes** — Auto-generated MCQs per topic, tracked and scored
- **Exam Mode** — Upload PYQs and syllabus to simulate a real exam environment
- **Dashboard** — Mastery table, rescue plan timeline, and progress metrics
- **OAuth Login** — Google & GitHub sign-in via Passport.js + JWT
- **File Upload** — PDFs, DOCX, and images ingested and embedded into Pinecone

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + React Router v7 + Tailwind CSS |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| AI Agent | LangGraph (TypeScript) |
| LLM | OpenAI (`gpt-4o`) |
| Embeddings | Cohere (`embed-english-v3.0`) |
| Vector DB | Pinecone |
| Database | MongoDB (Mongoose) |
| Auth | Passport.js (Google, GitHub OAuth) + JWT |
| File Storage | Cloudinary |
| Tracing | LangSmith |
| Web Search | Tavily |

---

## 📁 Project Structure

```
AI-Tutor/
├── backend/                  # Express + TypeScript API
│   ├── src/
│   │   ├── agents/           # LangGraph state machine (graph, nodes, prompts)
│   │   ├── config/           # DB, env, logger, passport, pinecone, cloudinary
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth, error handler, rate limiter, validator
│   │   ├── models/           # Mongoose schemas (User, Session, Topic, Quiz…)
│   │   ├── pipelines/        # RAG pipelines (ingest, retriever, topic extractor, PYQ parser)
│   │   ├── routes/           # Express routers
│   │   ├── types/            # Shared TypeScript types
│   │   └── utils/            # AppError, cloudinary upload, mastery calculator
│   ├── scripts/              # Admin scripts (deleteUser)
│   ├── langgraph.json        # LangGraph CLI config
│   ├── nodemon.json
│   └── package.json
│
└── frontend/                 # React app (Create React App)
    ├── src/
    │   ├── components/       # Reusable components (layout, sidebar, quiz, tutor…)
    │   ├── context/          # AuthContext
    │   ├── lib/              # Axios client
    │   ├── pages/            # Route-level pages
    │   ├── services/         # API call functions
    │   └── stores/           # Zustand stores
    └── package.json
```

---

## 🚀 Getting Started (Development Setup)

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | `>= 20.x` | [nodejs.org](https://nodejs.org) |
| npm | `>= 10.x` | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com) |

You'll also need accounts / API keys for:

- **MongoDB Atlas** — [mongodb.com/atlas](https://www.mongodb.com/atlas) (free tier works fine)
- **OpenAI** — [platform.openai.com](https://platform.openai.com)
- **Cohere** — [cohere.com](https://cohere.com)
- **Pinecone** — [pinecone.io](https://pinecone.io)
- **Cloudinary** — [cloudinary.com](https://cloudinary.com)
- **Google OAuth** — [console.cloud.google.com](https://console.cloud.google.com)
- **GitHub OAuth** — [github.com/settings/developers](https://github.com/settings/developers)
- **LangSmith** *(optional, for tracing)* — [smith.langchain.com](https://smith.langchain.com)
- **Tavily** — [tavily.com](https://tavily.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/Bhavesh-Solminde/AI-Tutor.git
cd AI-Tutor
```

---

### 2. Backend Setup

#### 2a. Install dependencies

```bash
cd backend
npm install
```

#### 2b. Create the `.env` file

A `.env.example` file is included with all required variables and descriptions. Copy it and fill in your values:

```bash
cp .env.example .env
```

Then open `backend/.env` and fill in each value. See the comments inside `.env.example` for where to get each key.

> **Tip:** Generate a strong JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

#### 2c. Set up Pinecone Index

1. Go to [pinecone.io](https://app.pinecone.io) → Create Index
2. Name: `neuralnest-os`
3. Dimensions: `1024` (Cohere `embed-english-v3.0` output size)
4. Metric: `cosine`

#### 2d. Set up OAuth Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web Application)
3. Add Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Secret into `.env`

**GitHub OAuth:**
1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Secret into `.env`

#### 2e. Start the backend dev server

```bash
npm run dev
```

The Express API will start on **http://localhost:5000**.

> Optionally, run the LangGraph dev server for local agent inspection:
> ```bash
> npx @langchain/langgraph-cli dev
> ```
> This opens the LangGraph Studio UI to visualise your agent graph.

---

### 3. Frontend Setup

Open a **new terminal tab**.

#### 3a. Install dependencies

```bash
cd frontend
npm install
```

#### 3b. Create the `.env` file

A `.env.example` file is included. Copy it and you're ready to go:

```bash
cp .env.example .env
```

The only variable is `REACT_APP_API_URL` — it should point to your running backend (default: `http://localhost:5000`).

#### 3c. Start the frontend dev server

```bash
npm run dev
# or
npm start
```

The React app will open on **http://localhost:3000**.

---

### 4. Verify Everything Is Running

| Service | URL | Expected |
|---|---|---|
| Frontend | http://localhost:3000 | NeuralNest landing page |
| Backend API | http://localhost:5000/api/health | `{ "status": "ok" }` |
| LangGraph Studio | http://localhost:2024 | Agent graph visualiser *(optional)* |

---

## 🔧 Available Scripts

### Backend (`/backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start backend with hot-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run delete:user` | Run the `deleteUser` admin script |

### Frontend (`/frontend`)

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start React dev server on port 3000 |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## 🛠️ Troubleshooting

**`❌ Invalid environment variables` on backend start**
→ One or more required env vars are missing. Check your `backend/.env` against the list above.

**MongoDB connection error**
→ Whitelist your IP in MongoDB Atlas → Network Access → Add IP Address (or use `0.0.0.0/0` for dev).

**OAuth redirect mismatch error**
→ The redirect URIs in Google/GitHub console must exactly match what's in your `.env` (`BACKEND_URL`).

**Pinecone 404 or dimension mismatch**
→ Ensure the index name matches `PINECONE_INDEX` and was created with dimension `1024`.

**CORS errors on frontend**
→ Make sure `FRONTEND_URL` in `backend/.env` is set to `http://localhost:3000`.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Commit using conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`
3. Push and open a Pull Request against `main`

---

## 📄 License

MIT © [Bhavesh Solminde](https://github.com/Bhavesh-Solminde)
