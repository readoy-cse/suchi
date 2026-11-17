# Suchi Frontend

The React + Vite frontend for Suchi. For full project setup and architecture, see the [root README](../README.md).

## Development

Run the frontend separately from the project root:

```bash
npm run dev:frontend
```

Or run directly from inside this `frontend` directory:

```bash
npm run dev
```

The dev server starts at <http://localhost:5173>. Requests sent to `/api/*` are automatically proxied to the backend at <http://localhost:4000>. No frontend `.env` configuration is needed for local development.
