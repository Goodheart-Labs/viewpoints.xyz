# Shuffle

New UI experiment for polislike

Currently deployed at <https://viewpoints.xyz/>

## Getting Started

### Prerequisites

- [bun >= 1.0.6](https://bun.sh)
- [postgres >= 14.9](https://www.postgresql.org/)

### Installing

```bash
bun i
```

### Get Envirioment Variables

Copy .env.example to .env and fill in the values.

If you need live env vars, link vercel project (`vercel link`) then run the following command:

```bash
bun run env:pull
```

### Running

Start local database - `docker compose up -d`

Make sure you've installed the dependencies and have the environment variables set.

If you've got a new database (and you are not using `docker-compose.yml`), import db/RUN_BEFORE_MIGRATIONS.sql into it.

Then deploy migrations (if needed):

```bash
bun run migrate up
```

Check current migrations status:

```bash
bun run migrate version
```

Run project:

```bash
bun run dev
```

### Creating a new migration
  
```bash
bun run migrate make <migration_name>
```

### Building for production

```bash
bun run build
```


### Deploying Without Viewpoints Logo

You can deploy this without the logo by setting the `NEXT_PUBLIC_VIEWPOINTS_LOGO` environment variable to `false`.
