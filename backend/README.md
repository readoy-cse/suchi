# Suchi Backend

The Express API for Suchi. For full project setup, see the [root README](../README.md).

Run the backend from the project root:

```bash
npm --prefix backend install
npm --prefix backend run dev
```

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`. The API listens on port `4000` by default and exposes `GET /api/health`.