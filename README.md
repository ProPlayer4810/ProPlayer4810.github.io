# Zaikora — Your Smart Indian Food Companion

Full-stack implementation of the feature set in [requirements.md](requirements.md): a React client and a
Node.js/Express + SQLite backend, with AI-powered "smart" features (Claude, OpenAI, or Groq — whichever
key you provide) that gracefully fall back to a curated Indian food database when no AI key is configured.

## Structure

- `client/` — React (Vite) web UI
- `server/` — Node.js/Express API, SQLite storage (`server/data/zaikora.db`, created on first run)

## Setup

```bash
cd server && npm install
cd ../client && npm install
```

Optional but recommended — enable the AI engine for open-ended meal parsing, taste matching, photo
recognition, recipe transforms, and plate building. Zaikora supports **Claude (Anthropic)**, **OpenAI**,
and **Groq**:

```bash
cd server
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-... and/or OPENAI_API_KEY=sk-... and/or GROQ_API_KEY=gsk_...
```

Which provider is used is picked up automatically from whichever key is set:
- Only one key set → uses that provider
- More than one set → defaults to Claude, then OpenAI, then Groq (in that priority order), unless you set
  `AI_PROVIDER=anthropic` / `openai` / `groq` in `.env` to force a specific one
- None set → falls back to rule-based logic (see below)

Model names are configurable via `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `GROQ_MODEL` in `.env` (defaults:
`claude-sonnet-4-5`, `gpt-4o`, `llama-3.1-8b-instant`). Check which provider is active via
`GET /api/health` (returns `{ aiEnabled, aiProvider }`) or the server's startup log line. Groq's API is
OpenAI-compatible, so it's implemented as an OpenAI-client call pointed at Groq's endpoint.

Without any key, Zaikora still works fully — it uses rule-based logic against the local Indian food
database (`server/src/data/indianFoods.json`) instead. Photo-based meal logging specifically requires an
AI key with vision support (Anthropic or OpenAI — most Groq models, including the default
`llama-3.1-8b-instant`, are text-only).

## Run

```bash
# terminal 1
cd server && npm run dev   # http://localhost:4000

# terminal 2
cd client && npm run dev   # http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173. There's a single seeded demo user/profile (no login) — adjust goal, region,
and diet type from the Settings page.

## Feature → route map

| Feature | Client page | Server route |
|---|---|---|
| Smart Indian Food Tracker | `/tracker` (Zaika Tracker) | `POST /api/meals/text`, `POST /api/meals/photo` |
| Taste Match Engine | `/taste-match` (Taste Match AI) | `POST /api/taste-match` |
| Zaikora Balance Score | `/` (Dashboard) | `GET /api/balance-score` |
| Street Food Optimizer | `/street-food` | `POST /api/street-food/optimize` |
| Family Food Mode | `/family-food` | `POST /api/family-food` |
| Recipe Transformer | `/recipe-transformer` (Zaika Remix) | `POST /api/recipe-transform` |
| Regional Food Intelligence | `/regional` | `GET /api/regional` |
| Goal Personalization | `/settings` | `PUT /api/user` |
| Zaikora Plate Builder | `/plate-builder` | `POST /api/plate-builder` |
| Smart Grocery Assistant | `/grocery` (Smart Basket) | `POST /api/grocery/generate` |
| Zaikora Journey (gamification) | `/journey` | `GET /api/journey` |
| Health Connect | `/health-connect` (Lifestyle Sync) | `POST /api/health-connect` |

Budget Healthy Eating is a documented future expansion (see requirements.md) and is not implemented.
