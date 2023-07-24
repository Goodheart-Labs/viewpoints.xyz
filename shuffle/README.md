# Shuffle

New UI experiment for polislike

Currently deployed at <https://viewpoints.xyz/>

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 18)
- [Docker desktop](https://www.docker.com/products/docker-desktop/)

### Installing

```bash
npm install
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
npm run dev
```
