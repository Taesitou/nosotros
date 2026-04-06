# Nosotros

A private memory timeline for two people.

## Deployment with Docker and Tailscale
Run `docker-compose up --build -d`.

To access it via Tailscale, use `http://<tailscale-ip>`.
The application is securely bound to local networks only, so it's not exposed to the public internet.

## Initial Setup
- Configure your `.env` for backend `JWT_SECRET` and add the passwords. 
- Run `npm run db:push` in the `backend/` directory to setup Prisma.
