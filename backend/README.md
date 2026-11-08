# Suchi Backend

The Express API for Suchi. For full project setup, see the [root README](../README.md).

Run the backend separately from the project root:

```bash
npm run dev:backend
```

If `backend/.env` does not exist, copy `.env.example` to `.env`. Configure `MONGODB_URI`, a 32-character `JWT_SECRET`, and `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Start MongoDB, then seed the first admin from the project root with:

```bash
npm run seed:admin --workspace backend
```

The API listens on port `4000` by default and exposes `GET /api/health`.