# Deploy & environment notes

## Local Compose

```bash
docker compose up --build
```

- Web: http://localhost:8080  
- API: http://localhost:5000  
- Override secrets via a root `.env` or edit `docker-compose.yml` (`JWT_SECRET`, etc.) before any shared/public use.

Reset DB volume:

```bash
docker compose down -v
```

## Production checklist

1. Strong unique `JWT_SECRET` (32+ random bytes).
2. `CLIENT_ORIGIN` = exact frontend origin.
3. `VITE_API_URL` = public API base including `/api/v1`.
4. TLS termination at the host (Render/Vercel).
5. Run migrations on every deploy before traffic.
6. Do not enable `SEED_ON_START` in real production unless you intend demo data.

## Render + Vercel

See root [README.md](./README.md#deploy) for step-by-step service setup.
