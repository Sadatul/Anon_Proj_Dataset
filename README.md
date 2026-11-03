# Setting Up the Benchmark Applications

This dataset contains five web applications under `projects/`:

| App | Folder | Stack | URL | Injected bugs |
|---|---|---|---|---|
| Academy | `projects/Academy-main` | Spring Boot + React + PostgreSQL (Docker) | http://localhost:3000 | [`BUG_INJECTION_README.md`](projects/Academy-main/BUG_INJECTION_README.md) |
| Amazona | `projects/mern-amazona` | MERN | http://localhost:3000 | [`BUG_INJECTION_README.md`](projects/mern-amazona/BUG_INJECTION_README.md) |
| DevConnector | `projects/devconnector_2.0` | MERN | http://localhost:3000 | [`BUG_INJECTION_README.md`](projects/devconnector_2.0/BUG_INJECTION_README.md) |
| Kind Hands | `projects/kind-hands` | React (Vite) + Express + MongoDB + Firebase Auth | http://localhost:5173 | [`BUG_INJECTION_README.md`](projects/kind-hands/kind-hands-client/BUG_INJECTION_README.md) |
| Ghostfolio | `projects/ghostfolio` | Angular + NestJS + PostgreSQL + Redis (Nx) | http://localhost:4200 | [`BUG_INJECTION_README.md`](projects/ghostfolio/BUG_INJECTION_README.md) |

Each app has been modified with intentionally injected bugs. The `BUG_INJECTION_README.md` linked for each app describes each bug, the files it changes and, where available, how to roll it back.

**Run one app at a time.** Academy, Amazona and DevConnector all serve on port 3000, and the Kind Hands API also uses port 3000.

## Prerequisites

- Docker, with the Compose plugin (`docker compose`)
- Node.js 22 or later (Ghostfolio needs `>= 22.18`; see `projects/ghostfolio/.nvmrc`)
- npm

---

## MongoDB (shared by Amazona, DevConnector and Kind Hands)

These three apps expect MongoDB at `localhost:27017`. Start one container and leave it running. Each app uses its own database inside it.

```bash
docker run -d --name bench-mongo -p 27017:27017 \
  -v bench-mongo-data:/data/db --restart unless-stopped mongo:5.0
docker ps | grep bench-mongo        # should show 0.0.0.0:27017->27017
```

- Use `mongo:5.0`. DevConnector uses Mongoose 5.11, which doesn't work with newer MongoDB servers.
- Data is kept in the `bench-mongo-data` volume, so it survives container and machine restarts. Next time, run `docker start bench-mongo`.
- If a backend crashes at startup (`[nodemon] app crashed`) and the React dev server shows `Proxy error: ... ECONNREFUSED`, MongoDB isn't reachable.

Optional snapshot and restore, to reset an app's data between sessions:

```bash
docker exec bench-mongo mongodump --db <dbname> --out /data/db/backup_<dbname>
docker exec bench-mongo mongorestore --drop --db <dbname> /data/db/backup_<dbname>/<dbname>
```

Database names: `amazona`, `devconnector`, `volunteerDB` (Kind Hands).

---

## Academy

Injected bugs: see [`projects/Academy-main/BUG_INJECTION_README.md`](projects/Academy-main/BUG_INJECTION_README.md).

```bash
cd projects/Academy-main
cp .env.example .env
chmod +x run-docker.sh
./run-docker.sh start      # PostgreSQL on 5434, backend on 8081, frontend on 3000
./run-docker.sh stop       # when finished
```

- Default admin login: `admin@academy.com` / `admin123`.
- `run-docker.sh` checks for the old `docker-compose` command. If it says *"Docker Compose is not installed"* but `docker compose` works, add a small wrapper:
  ```bash
  mkdir -p ~/.local/bin
  printf '#!/bin/sh\nexec docker compose "$@"\n' > ~/.local/bin/docker-compose
  chmod +x ~/.local/bin/docker-compose
  ```
- Don't use `./run-docker.sh clean` unless you want to lose all data: it deletes the database volume. To back up and restore, use `pg_dump` / `psql` on the `academydb` database in the database container.

---

## Amazona

Injected bugs: see [`projects/mern-amazona/BUG_INJECTION_README.md`](projects/mern-amazona/BUG_INJECTION_README.md).

Needs MongoDB (see above).

```bash
cd projects/mern-amazona/backend
cp .env.example .env               # MONGODB_URI=mongodb://localhost:27017/amazona
npm install
npm start                          # API on http://localhost:4000

curl http://localhost:4000/api/seed   # wipes and seeds sample users and products

# in a second terminal
cd projects/mern-amazona/frontend
npm install
npm start                          # http://localhost:3000 (proxies the API to port 4000)
```

- The API runs on port **4000**, not the 5000 that the app's own README says.
- Seeded admin login: `admin@example.com` / `123456`. Calling `/api/seed` again resets the data.

---

## DevConnector

Injected bugs: see [`projects/devconnector_2.0/BUG_INJECTION_README.md`](projects/devconnector_2.0/BUG_INJECTION_README.md).

Needs MongoDB (see above).

```bash
cd projects/devconnector_2.0
npm install
npm install --prefix client
npm run dev                        # API on 5000, client on http://localhost:3000
```

- The MongoDB URI is already set in `config/default.json` (`mongodb://localhost:27017/devconnector`).
- If MongoDB was started after `npm run dev`, type `rs` and press Enter in that terminal to restart nodemon.
- The database starts empty. Register users through the UI.
- `githubToken` in `config/default.json` is a placeholder. It's only used to show a profile's GitHub repositories. Put in a personal access token if you want that section to work.

---

## Kind Hands

Injected bugs: see [`projects/kind-hands/kind-hands-client/BUG_INJECTION_README.md`](projects/kind-hands/kind-hands-client/BUG_INJECTION_README.md).

Kind Hands uses **Firebase Authentication** for sign-up and login (in the browser), and **MongoDB** (`volunteerDB`) for posts and volunteer requests. The Express server checks Firebase ID tokens on protected routes using `firebase-admin`. The client config and the server key **must come from the same Firebase project**. Otherwise, protected calls fail with `401 Invalid Firebase token`.

### 1. Create a Firebase project
1. Go to https://console.firebase.google.com and click **Add project**. You can turn Google Analytics off.
2. Go to **Build → Authentication → Get started**. On the **Sign-in method** tab, enable **Email/Password**. Google sign-in is optional.
3. On **Authentication → Settings → Authorized domains**, check that `localhost` is listed.

### 2. Client config
1. Go to **Project settings → General → Your apps** and click the **Web (`</>`)** icon. Register the app; Hosting isn't needed.
2. Copy the `firebaseConfig` values into `projects/kind-hands/kind-hands-client/.env`. `.env.example` lists every key:
   ```bash
   VITE_API_URL=http://localhost:3000
   VITE_API_KEY=                     # ImgBB key, optional

   VITE_FIREBASE_API_KEY=<apiKey>
   VITE_FIREBASE_AUTH_DOMAIN=<projectId>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<projectId>
   VITE_FIREBASE_STORAGE_BUCKET=<storageBucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
   VITE_FIREBASE_APP_ID=<appId>
   ```
   If any Firebase value is missing, the page stays blank and the console shows `Missing Firebase config values: ...`.
3. `VITE_API_KEY` is only used to upload the optional opportunity image to ImgBB. Without it, uploads fail but the rest of the app works. You can get a free key at https://api.imgbb.com.

### 3. Server key
1. Go to **Project settings → Service accounts → Generate new private key**. Keep the downloaded JSON file private and don't commit it.
2. Create `projects/kind-hands/kind-hands-server-site/.env`:
   ```bash
   cd projects/kind-hands/kind-hands-server-site
   KEY_B64=$(base64 -w0 /path/to/<project>-firebase-adminsdk-xxxx.json)
   cat > .env <<EOF
   PORT=3000
   DB_URI=mongodb://localhost:27017
   FB_SERVICE_KEY=$KEY_B64
   EOF
   ```
   - The server accepts either `FB_SERVICE_KEY` (base64 JSON) or `FIREBASE_SERVICE_ACCOUNT` (the JSON on one line, or base64). Base64 avoids problems with the newlines inside `private_key`.
   - `serviceAccountKey.json` in this folder is empty and isn't used.
   - If the key is missing, the server exits with `Missing Firebase config. Set FB_SERVICE_KEY ... or FIREBASE_SERVICE_ACCOUNT ...`.

### 4. Start
```bash
# terminal 1: API (needs MongoDB)
cd projects/kind-hands/kind-hands-server-site
npm install
node index.js                      # http://localhost:3000

# terminal 2: client
cd projects/kind-hands/kind-hands-client
npm install
npm run dev                        # http://localhost:5173
```

### 5. Check it works
Register a user at http://localhost:5173. Passwords need 6 or more characters, with at least one uppercase and one lowercase letter. The user should then appear in the Firebase console under **Authentication → Users**. Log in and open the dashboard. If it loads without a `401`, token verification works.

Users are stored only in Firebase, so restoring MongoDB doesn't remove them. Delete test users in the Firebase console.

---

## Ghostfolio

Injected bugs: see [`projects/ghostfolio/BUG_INJECTION_README.md`](projects/ghostfolio/BUG_INJECTION_README.md).

```bash
cd projects/ghostfolio
cp .env.dev .env                   # set the passwords, salt and secrets
echo 'ROOT_URL=http://localhost:4200' >> .env
npm install
docker compose -f docker/docker-compose.dev.yml up -d   # PostgreSQL on 5433, Redis on 6380
npm run database:setup
npm run start:server               # terminal 1
npm run start:client               # terminal 2 -> http://localhost:4200/en
```

- The dev server is set to plain **HTTP** (`"ssl": false` in `apps/client/project.json`). To use HTTPS instead, set it back to `true` and change `ROOT_URL` to `https://localhost:4200`.
- `docker/docker-compose.dev.yml` maps host port 5433 to PostgreSQL's port 5432 inside the container. The `DATABASE_URL` in `.env` uses 5433.
- If you get a PostgreSQL **authentication** error, the volume was probably first created with a different `POSTGRES_PASSWORD`, and PostgreSQL only reads it when the volume is first created. On an empty database, run `docker compose -f docker/docker-compose.dev.yml down -v`, then `up -d` and `npm run database:setup` again.
- Users log in with a **Security Token**. Click *Get Started* to create a user and copy its token.
