# ClipAssist Web

This is the frontend application for ClipAssist, a SaaS video clipping tool.

## Running the frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

Note that the FastAPI backend must be running on port 8000 with CORS allowed for `http://localhost:3000`.
