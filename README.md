# KLAY Utensils & Appliances — Full-Stack Web Application

A full-stack eCommerce platform featuring a React (Vite) frontend, Node.js/Express REST API backend, and MongoDB database, fully automated for production deployment on AWS EC2 using CloudFormation, Nginx, PM2, and GitHub Actions CI/CD.

---

## 🏛️ Production Hosting Architecture

```
                            [ USER / BROWSER ]
                                    │
                                    │ HTTP Request (Port 80)
                                    ▼
                  ┌───────────────────────────────────┐
                  │          AWS EC2 INSTANCE         │
                  │         (Ubuntu 24.04 LTS)        │
                  │                                   │
                  │   ┌───────────────────────────┐   │
                  │   │    NGINX (Reverse Proxy)  │   │
                  │   └─────────────┬─────────────┘   │
                  │                 │                 │
                  │    ┌────────────┴───────────┐     │
                  │    │                        │     │
                  │    ▼                        ▼     │
                  │  Static Files           Backend   │
                  │  (Frontend React)       API (PM2) │
                  │  /var/www/app/dist      Port 5000 │
                  └─────────────────────────────┬─────┘
                                                │
                                                │ Database Connection
                                                ▼
                                    [ CLOUD DATABASE ]
                                (MongoDB Atlas M0 - 24/7)
```

---

## 📁 Infrastructure & Deployment Files

| File | Purpose |
|---|---|
| [`infra/ec2-instance.yaml`](infra/ec2-instance.yaml) | CloudFormation template: Ubuntu 24.04, auto-saved SSM key pair, security group (80, 22), 2GB swap, Node 22, Git, Nginx, PM2 |
| [`infra/nginx.conf`](infra/nginx.conf) | Nginx config: serves React static build with SPA routing (`try_files`), proxies `/api/` to port 5000, proxies `/uploads/` |
| [`backend/ecosystem.config.cjs`](backend/ecosystem.config.cjs) | PM2 configuration running Express in `fork` mode for single-core `t2.micro` instances |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | GitHub Actions CI/CD pipeline: builds frontend, creates/updates EC2, sets up backend `.env`, and reloads services |

---

## 🚀 Quick Setup & Deployment Guide

1. **Step 1: Set Up Cloud Database & GitHub Secrets**  
   Follow [`docs/01-setup-github-secrets.md`](docs/01-setup-github-secrets.md) to create your free MongoDB Atlas cluster and add your AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, `MONGODB_URI`, `JWT_SECRET`).

2. **Step 2: Deploy & Access Your Live Website**  
   Follow [`docs/02-deploy-and-connect.md`](docs/02-deploy-and-connect.md) to trigger the GitHub Actions workflow, access the live website at `http://<EC2_PUBLIC_IP>`, test the API at `/api/health`, and SSH into the server.

---

## 💻 Local Development

```bash
# Run both Frontend and Backend concurrently
npm run dev-all

# Or run separately:
# Terminal 1 - Frontend:
npm run dev

# Terminal 2 - Backend:
cd backend && npm run dev
```
