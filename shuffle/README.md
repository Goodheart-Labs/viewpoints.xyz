# Shuffle

New UI experiment for polislike

Currently deployed at <https://viewpoints.xyz/>

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 18)
- [Docker desktop](https://www.docker.com/products/docker-desktop/)

### Installing

```bash
pnpm install
```

### Get Envirioment Variables

Link vercel project (`vercel link`) then run the following command:

```bash
pnpm env:pull
```

### Running

Start database:

```bash
docker-compose up -d
```

Deploying migrations (if needed):

```bash
npx prisma migrate dev
```

Run project:

```bash
pnpm dev
```
