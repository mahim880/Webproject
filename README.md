# PrayFind Backend

This is a simple Node.js + Express backend for the PrayFind web application.

## Setup Instructions

1. Make sure you have Node.js and MongoDB installed on your system.
2. Start MongoDB server (e.g., `mongod`).
3. Open terminal and navigate to this folder.
4. Run the following commands:

```bash
npm install
node server.js
```

Server will be available at: http://localhost:3000

## API Endpoints

- `POST /api/locations` - Submit a new prayer location.
- `GET /api/locations` - Get all submitted locations.
