# How to Start the Project

Use the Node dev server so dashboard and GPS API proxy run together (fixes browser fetch/CORS issues).

## 1) Open terminal in project folder

```bash
cd /home/ubuntu/projects/tbbgps
```

## 2) Start dev server + proxy

```bash
node dev-server.js
```

Default port is `8090`. You can change port:

```bash
PORT=8091 node dev-server.js
```

## 3) Open in browser

```text
http://127.0.0.1:8090/fleet-dashboard.html
```

## 4) Stop server

In the same terminal where server is running, press:

```text
Ctrl + C
```

---

## Quick checks

```bash
curl -I http://127.0.0.1:8090/fleet-dashboard.html
curl -I http://127.0.0.1:8090/gps-api/api/v3/auth/check
```
