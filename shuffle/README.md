# Shuffle

New UI experiment for polislike

Currently deployed at [https://polislike.vercel.app](https://polislike.vercel.app)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 18)
- [PostgreSQL](https://www.postgresql.org/) (>= 14; use `brew install postgresql`)

### Installing

```bash
npm install
```

You'll also want to setup the database. The defaults in this script will match those in .env.example:

```bash
bash infra/setup-database.sh
```

### Running

```bash
npm run dev
```
