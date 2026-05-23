# Kicmatch

Piattaforma all-in-one per gestione eventi: RSVP, moduli custom, pagamenti Stripe Connect, check-in QR.

## Stack
- Backend: NestJS 10 + Prisma 7 + PostgreSQL 16
- Frontend CRM: React 18 + Vite + Tailwind + shadcn/ui + TanStack Router/Query
- Shared: pacchetto `@kicmatch/shared` con schemi Zod
- Infra dev: Docker Compose (Postgres, Redis, MinIO + api/crm in dev mode con hot reload)
- Deploy: Dokploy

## Prerequisiti
- Docker + Docker Compose
- (Opzionale, per lavorare fuori container) Node 20 + pnpm 9

## Setup — un solo comando

```bash
docker compose up
```

Questo avvia automaticamente:
- **postgres** (host 5434)
- **redis** (host 6381)
- **minio** (host 9000, console 9001)
- **api** Nest in dev mode con hot reload (host 3010)
- **crm** Vite in dev mode con hot reload (host 5173)

Al primo avvio i container `api` e `crm` eseguono `pnpm install` + `prisma generate` + `prisma migrate deploy` automaticamente (richiede qualche minuto). Le run successive sono istantanee perché i `node_modules` restano nei volumi.

Per fermare tutto: `docker compose down` (o `Ctrl+C` se in foreground).

## URL utili
- CRM: http://localhost:5173
- API: http://localhost:3010/api/v1
- API Swagger: http://localhost:3010/api/docs
- API health: http://localhost:3010/api/v1/health
- MinIO console: http://localhost:9001 (user `kicmatch` / pass `kicmatch-secret`)

## Modifica codice
Bind mount attivo su `.:/app` dentro i container `api` e `crm`. Modifichi un file con il tuo editor sull'host → Nest `--watch` e Vite HMR ricaricano in automatico.

## Comandi utili

```bash
docker compose up                           # avvia tutto (dev)
docker compose up -d                        # in background
docker compose logs -f api                  # log dell'API
docker compose logs -f crm                  # log del CRM
docker compose down                         # ferma e rimuove i container
docker compose down -v                      # ...e cancella anche i volumi (reset DB)

docker compose --profile prod up -d --build # test immagini produzione (api 3002, crm 8080)

# Lavoro fuori container (richiede pnpm + node sull'host):
pnpm typecheck
pnpm test
pnpm build
```

## Workspaces
- `apps/api` — REST API NestJS
- `apps/crm` — Dashboard organizzatore
- `packages/shared` — schemi Zod e tipi condivisi

