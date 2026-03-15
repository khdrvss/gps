# START PROJECT (Fresh Instructions)

This project runs as a static dashboard + local Node proxy server.
Use the local server so browser/API requests work correctly (CORS-safe).

## 0) Requirements

- Node.js installed (`node -v` should work)
- Git installed (`git --version` should work)

## 1) Get the project

### Option A: Clone from GitHub

```bash
git clone https://github.com/khdrvss/gps.git
cd gps
```

### Option B: If project already exists locally

```bash
cd /home/ubuntu/projects/tbbgps
```

## 2) Start dev server

```bash
node dev-server.js
```

Default URL:

```text
http://127.0.0.1:8090/fleet-dashboard.html
```

## 3) Open dashboard

Open this in browser:

```text
http://127.0.0.1:8090/fleet-dashboard.html
```

## 4) (Optional) Run on different port

```bash
PORT=8091 node dev-server.js
```

Then open:

```text
http://127.0.0.1:8091/fleet-dashboard.html
```

## 5) Health check commands

```bash
curl -I http://127.0.0.1:8090/fleet-dashboard.html
curl -I http://127.0.0.1:8090/gps-api/api/v3/auth/check
```

Expected: HTTP status `200` for dashboard endpoint.

## 6) Stop server

In the running terminal, press:

```text
Ctrl + C
```
