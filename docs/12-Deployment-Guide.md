# Document 12 -- Deployment Guide

**Project:** Enterprise Task Management System (ETMS)\
**Document Type:** Development → UAT → Production Deployment Guide\
**Version:** 1.0\
**Frontend:** React + Vite\
**Backend:** Node.js + Express\
**Database:** MongoDB Atlas\
**Process Manager:** PM2\
**Reverse Proxy:** Nginx\
**TLS/SSL:** Let's Encrypt / Certbot\
**Target Server:** Ubuntu Linux VPS / Cloud VM

------------------------------------------------------------------------

# 1. Purpose

This document defines the deployment architecture and operational
process for moving ETMS through:

``` text
Development
     ↓
UAT
     ↓
Production
```

It covers:

-   MongoDB Atlas
-   Backend deployment
-   Frontend deployment
-   Nginx
-   PM2
-   SSL/TLS
-   Environment variables
-   Release verification
-   Rollback
-   Logging
-   Security
-   Deployment responsibilities

The objective is to keep Development, UAT and Production isolated while
using the same application architecture.

------------------------------------------------------------------------

# 2. Environment Strategy

ETMS uses three primary environments.

  Environment   Purpose
  ------------- --------------------------------------------
  Development   Daily developer/intern work
  UAT           Integrated testing and business acceptance
  Production    Live application

Recommended domain model:

``` text
Development
Frontend: http://localhost:5173
Backend:  http://localhost:5000

UAT
Frontend: https://uat.example.com
Backend:  https://api-uat.example.com

Production
Frontend: https://app.example.com
Backend:  https://api.example.com
```

Replace `example.com` with the real ETMS domain.

------------------------------------------------------------------------

# 3. High-Level Production Architecture

``` text
                     Internet
                         │
                         ▼
                  ┌─────────────┐
                  │    Nginx    │
                  │  HTTPS/SSL  │
                  └──────┬──────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
   React Static Build             Node.js Backend
   /var/www/etms/...               PM2 Process
                                         │
                                         ▼
                                  MongoDB Atlas
```

Nginx handles public HTTP/HTTPS traffic.

PM2 keeps Node.js backend processes running.

MongoDB Atlas provides managed database hosting.

------------------------------------------------------------------------

# 4. Repository Structure

``` text
enterprise-task-management/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── ecosystem.config.cjs
│
├── docs/
└── README.md
```

Frontend and backend are deployed separately even though they live in
one repository.

------------------------------------------------------------------------

# 5. Deployment Flow

Normal release flow:

``` text
Feature Branches
      ↓
develop
      ↓
Development Testing
      ↓
release/x.y.z
      ↓
UAT Deployment
      ↓
QA / Business Acceptance
      ↓
main
      ↓
Production Deployment
      ↓
Version Tag
```

Follow Document 08 for Git rules.

------------------------------------------------------------------------

# PART I -- DEVELOPMENT ENVIRONMENT

# 6. Development Requirements

Developer machines require:

``` text
Git
Node.js
npm
MongoDB Atlas access or approved local test DB
Code editor
Postman
Browser
```

Check versions:

``` bash
node --version
npm --version
git --version
```

------------------------------------------------------------------------

# 7. Clone Repository

``` bash
git clone <repository-url>
cd enterprise-task-management
```

Normal development starts from:

``` bash
git checkout develop
git pull origin develop
```

Then create a ticket branch:

``` bash
git checkout -b feature/ETMS-205-task-create
```

------------------------------------------------------------------------

# 8. Backend Development Setup

``` bash
cd backend
npm install
```

Create:

``` text
backend/.env
```

Example:

``` env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<development-db>

JWT_ACCESS_SECRET=<development-secret>
JWT_REFRESH_SECRET=<development-secret>

FRONTEND_URL=http://localhost:5173

LOG_LEVEL=debug
```

Start using the project's development script, for example:

``` bash
npm run dev
```

Verify:

``` text
http://localhost:5000
```

and the configured health endpoint.

------------------------------------------------------------------------

# 9. Frontend Development Setup

``` bash
cd frontend
npm install
```

Create:

``` text
frontend/.env.development
```

Example:

``` env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
```

Start:

``` bash
npm run dev
```

Default Vite development URL is commonly:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# PART II -- MONGODB ATLAS

# 10. MongoDB Atlas Environment Separation

Do not use one database for all environments.

Recommended logical databases:

``` text
etms_development
etms_uat
etms_production
```

For stronger isolation, UAT and Production can use separate Atlas
projects/clusters depending on scale, budget and security requirements.

Production credentials must never be used by intern development
machines.

------------------------------------------------------------------------

# 11. Atlas Setup

Create/configure:

``` text
Atlas Project
    ↓
Cluster
    ↓
Database User
    ↓
Network Access
    ↓
Connection String
```

Create environment-specific database users with only the permissions
required by that application environment.

Avoid using broad administrative credentials in application
configuration.

------------------------------------------------------------------------

# 12. Atlas Network Access

Allow only required network sources.

Development may require approved developer IP access.

UAT:

``` text
UAT server public outbound IP
```

Production:

``` text
Production server public outbound IP
```

Avoid unrestricted access such as:

``` text
0.0.0.0/0
```

for production unless there is a specific controlled reason and
compensating security.

------------------------------------------------------------------------

# 13. MongoDB Connection String

Example format:

``` text
mongodb+srv://USERNAME:PASSWORD@CLUSTER/etms_production
```

Store it only as an environment secret:

``` env
MONGODB_URI=...
```

Never place it directly in:

``` text
app.js
server.js
repository code
Git
frontend code
```

------------------------------------------------------------------------

# 14. Atlas Indexes

Before production deployment verify indexes defined in Document 03.

Typical examples may include:

``` text
workspaceId
projectId
assigneeId
status
createdAt
isDeleted
email
```

Use compound indexes only where supported by real query patterns.

Deployment verification should include checking that expected indexes
exist.

------------------------------------------------------------------------

# 15. Atlas Backup Strategy

Production should use an Atlas tier/configuration that supports the
backup and recovery requirements defined for the project.

Operational planning should define:

``` text
backup frequency/capability
retention
restore procedure
restore testing
responsible owner
```

A backup strategy is incomplete if nobody has tested restoration.

------------------------------------------------------------------------

# PART III -- SERVER PREPARATION

# 16. Linux Server

Recommended server OS:

``` text
Ubuntu LTS
```

Update packages:

``` bash
sudo apt update
sudo apt upgrade -y
```

Install baseline packages:

``` bash
sudo apt install -y nginx git curl
```

------------------------------------------------------------------------

# 17. Create Deployment User

Avoid running the application permanently as `root`.

Example:

``` bash
sudo adduser deploy
```

Grant only required privileges.

Application files can be placed under an agreed path such as:

``` text
/var/www/etms/
```

or:

``` text
/home/deploy/apps/etms/
```

Keep one consistent convention.

------------------------------------------------------------------------

# 18. Install Node.js

Install the approved Node.js LTS version using the team's selected
installation method.

Verify:

``` bash
node --version
npm --version
```

UAT and Production should use the same major Node.js version.

Pin the expected version through project documentation and, where
useful:

``` text
.nvmrc
```

or `package.json` engines.

------------------------------------------------------------------------

# 19. Install PM2

Install globally:

``` bash
sudo npm install -g pm2
```

Verify:

``` bash
pm2 --version
```

------------------------------------------------------------------------

# PART IV -- BACKEND DEPLOYMENT

# 20. Backend Directory

Example:

``` text
/var/www/etms/backend
```

Clone the repository:

``` bash
cd /var/www
sudo git clone <repository-url> etms
```

Set correct ownership according to the deployment user:

``` bash
sudo chown -R deploy:deploy /var/www/etms
```

Then:

``` bash
cd /var/www/etms/backend
```

------------------------------------------------------------------------

# 21. Install Backend Dependencies

For a clean deployment:

``` bash
npm ci
```

For production-only runtime dependencies when appropriate to the
project's build/test process:

``` bash
npm ci --omit=dev
```

Do not blindly run `npm update` during deployment because it may change
dependency versions unexpectedly.

------------------------------------------------------------------------

# 22. Backend Environment Variables

Do not commit server `.env` files.

Example UAT configuration:

``` env
NODE_ENV=uat
PORT=5001

MONGODB_URI=<uat-atlas-uri>

JWT_ACCESS_SECRET=<uat-secret>
JWT_REFRESH_SECRET=<uat-secret>

FRONTEND_URL=https://uat.example.com

LOG_LEVEL=info
```

Production:

``` env
NODE_ENV=production
PORT=5000

MONGODB_URI=<production-atlas-uri>

JWT_ACCESS_SECRET=<strong-production-secret>
JWT_REFRESH_SECRET=<strong-production-secret>

FRONTEND_URL=https://app.example.com

LOG_LEVEL=info
```

Use the actual variables required by the ETMS backend.

------------------------------------------------------------------------

# 23. Environment Variable Rules

Never reuse:

``` text
development secrets in production
UAT database credentials in production
production secrets in UAT
```

Secrets should be different per environment.

Production secrets should be high-entropy values generated securely.

Do not send secrets through:

``` text
Git commits
screenshots
public chat channels
frontend environment variables
documentation files
```

------------------------------------------------------------------------

# 24. PM2 Ecosystem File

Example:

``` js
module.exports = {
  apps: [
    {
      name: "etms-api",
      script: "./src/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

File:

``` text
backend/ecosystem.config.cjs
```

Environment secrets should remain outside Git where possible rather than
being hardcoded into this file.

------------------------------------------------------------------------

# 25. Start Backend with PM2

``` bash
cd /var/www/etms/backend

pm2 start ecosystem.config.cjs
```

Check:

``` bash
pm2 status
```

Logs:

``` bash
pm2 logs etms-api
```

Restart:

``` bash
pm2 restart etms-api
```

Stop:

``` bash
pm2 stop etms-api
```

------------------------------------------------------------------------

# 26. PM2 Startup on Server Reboot

Run:

``` bash
pm2 startup
```

PM2 will print a command that must be executed with the required
privileges.

Then save the process list:

``` bash
pm2 save
```

Verify after a controlled reboot during environment setup.

------------------------------------------------------------------------

# 27. PM2 Useful Commands

``` bash
pm2 list
pm2 status
pm2 logs
pm2 logs etms-api
pm2 restart etms-api
pm2 stop etms-api
pm2 delete etms-api
pm2 monit
```

Do not use repeated blind restarts as a substitute for investigating
application errors.

------------------------------------------------------------------------

# 28. Backend Health Endpoint

Provide a lightweight health endpoint such as:

``` text
GET /health
```

Example response:

``` json
{
  "status": "UP"
}
```

Depending on the production architecture, health checks may separately
represent application liveness and dependency readiness.

Nginx/deployment verification should use the agreed health endpoint.

------------------------------------------------------------------------

# PART V -- FRONTEND DEPLOYMENT

# 29. Frontend Production Environment

Example:

``` text
frontend/.env.production
```

``` env
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_APP_ENV=production
```

UAT:

``` env
VITE_API_BASE_URL=https://api-uat.example.com/api/v1
VITE_APP_ENV=uat
```

Remember:

> `VITE_*` values are bundled into client-side code and must never
> contain private secrets.

------------------------------------------------------------------------

# 30. Build React Application

``` bash
cd /var/www/etms/frontend

npm ci
npm run build
```

Vite normally creates:

``` text
dist/
```

Verify:

``` bash
ls -la dist
```

------------------------------------------------------------------------

# 31. Frontend Deployment Directory

Recommended:

``` text
/var/www/etms/frontend/dist
```

Nginx can serve this directory directly.

Alternative release-directory strategy:

``` text
/var/www/etms-frontend/
├── releases/
│   ├── 20260801-001/
│   └── 20260808-001/
└── current -> releases/20260808-001/
```

A release/symlink strategy makes rollback safer for mature production
deployments.

------------------------------------------------------------------------

# PART VI -- NGINX

# 32. Nginx Role

Nginx performs:

``` text
HTTPS termination
frontend static file serving
backend reverse proxying
routing
security headers
HTTP → HTTPS redirect
```

Recommended domains:

``` text
app.example.com
api.example.com
```

UAT:

``` text
uat.example.com
api-uat.example.com
```

------------------------------------------------------------------------

# 33. Frontend Nginx Configuration

Create:

``` text
/etc/nginx/sites-available/etms-frontend.conf
```

Example:

``` nginx
server {
    listen 80;
    server_name app.example.com;

    root /var/www/etms/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

The SPA fallback is important for React routes such as:

``` text
/tasks
/projects/123
/users/456
```

------------------------------------------------------------------------

# 34. Backend Nginx Configuration

Create:

``` text
/etc/nginx/sites-available/etms-api.conf
```

Example:

``` nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The Node.js port should normally not need to be publicly exposed when
Nginx proxies to localhost.

------------------------------------------------------------------------

# 35. Enable Nginx Sites

``` bash
sudo ln -s /etc/nginx/sites-available/etms-frontend.conf \
  /etc/nginx/sites-enabled/etms-frontend.conf

sudo ln -s /etc/nginx/sites-available/etms-api.conf \
  /etc/nginx/sites-enabled/etms-api.conf
```

Test configuration:

``` bash
sudo nginx -t
```

If successful:

``` bash
sudo systemctl reload nginx
```

Never reload Nginx without testing the configuration first.

------------------------------------------------------------------------

# 36. Nginx Security Headers

Example baseline:

``` nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

A Content Security Policy should be designed based on the actual
frontend resources rather than copied blindly.

Do not rely on obsolete headers as the primary browser security
strategy.

------------------------------------------------------------------------

# 37. Upload Size

If ETMS supports attachments, Nginx may need an explicit request-size
limit.

Example:

``` nginx
client_max_body_size 20M;
```

The exact value must match the application's attachment policy.

The backend must still independently validate file size/type.

------------------------------------------------------------------------

# 38. Proxy Timeouts

For normal APIs, use sensible bounded timeouts.

Example:

``` nginx
proxy_connect_timeout 10s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

Long report/export endpoints should be designed intentionally rather
than simply setting unlimited timeouts.

------------------------------------------------------------------------

# PART VII -- SSL / HTTPS

# 39. DNS Prerequisite

Before requesting certificates, DNS must point to the server.

Example:

``` text
app.example.com      → server public IP
api.example.com      → server public IP
```

Verify DNS resolution before running Certbot.

------------------------------------------------------------------------

# 40. Install Certbot

Ubuntu example:

``` bash
sudo apt install -y certbot python3-certbot-nginx
```

------------------------------------------------------------------------

# 41. Generate Frontend Certificate

``` bash
sudo certbot --nginx -d app.example.com
```

Backend:

``` bash
sudo certbot --nginx -d api.example.com
```

If using `www`, include it only when DNS and Nginx are configured for
it.

------------------------------------------------------------------------

# 42. Verify SSL

Test:

``` text
https://app.example.com
https://api.example.com/health
```

Verify:

``` text
valid certificate
correct hostname
HTTPS redirect
no mixed-content errors
API calls use HTTPS
```

------------------------------------------------------------------------

# 43. Certificate Renewal

Let's Encrypt certificates are short-lived and should renew
automatically through the installed Certbot mechanism.

Check:

``` bash
sudo systemctl status certbot.timer
```

Test renewal:

``` bash
sudo certbot renew --dry-run
```

Periodically verify renewal instead of assuming it works forever.

------------------------------------------------------------------------

# PART VIII -- UAT DEPLOYMENT

# 44. UAT Purpose

UAT is used for:

``` text
integrated testing
business acceptance
QA regression
permission testing
deployment verification
pre-production validation
```

UAT must not point to the production database.

------------------------------------------------------------------------

# 45. UAT Architecture

``` text
https://uat.example.com
        │
        ▼
      Nginx
        │
        ├── React UAT build
        │
        └── https://api-uat.example.com
                     │
                     ▼
                  PM2 API
                     │
                     ▼
              MongoDB Atlas UAT
```

------------------------------------------------------------------------

# 46. UAT Deployment Process

Create release branch:

``` bash
git checkout develop
git pull origin develop

git checkout -b release/0.1.0
git push -u origin release/0.1.0
```

On UAT server:

``` bash
cd /var/www/etms
git fetch origin
git checkout release/0.1.0
git pull
```

Backend:

``` bash
cd backend
npm ci
npm test
pm2 restart etms-api-uat
```

Frontend:

``` bash
cd ../frontend
npm ci
npm run build
```

Then verify Nginx and run UAT smoke/regression tests.

Use environment-specific PM2 names and ports when UAT and Production
share infrastructure.

------------------------------------------------------------------------

# 47. UAT Acceptance Checklist

-   [ ] Login works
-   [ ] User management works
-   [ ] RBAC works
-   [ ] Projects work
-   [ ] Teams work
-   [ ] Tasks work
-   [ ] Sprints work
-   [ ] Comments/attachments work
-   [ ] Notifications work
-   [ ] Dashboard works
-   [ ] Reports work
-   [ ] Regression suite passes
-   [ ] Security checks pass
-   [ ] No P0 defects
-   [ ] No release-blocking P1 defects
-   [ ] Business acceptance recorded

Only accepted code proceeds to Production.

------------------------------------------------------------------------

# PART IX -- PRODUCTION DEPLOYMENT

# 48. Production Preconditions

Before deployment:

``` text
UAT approved
PRs reviewed
release candidate stable
tests passed
database changes reviewed
backup/recovery readiness confirmed
environment secrets available
rollback plan prepared
deployment owner identified
```

------------------------------------------------------------------------

# 49. Production Git Flow

After UAT approval:

``` text
release/1.0.0
      ↓ PR
main
```

Then tag the approved production commit:

``` bash
git checkout main
git pull origin main

git tag -a v1.0.0 -m "ETMS version 1.0.0"
git push origin v1.0.0
```

Production should deploy an exact approved commit/tag rather than an
unknown working-tree state.

------------------------------------------------------------------------

# 50. Production Backend Deployment

Example:

``` bash
cd /var/www/etms
git fetch --tags
git checkout v1.0.0
```

Backend:

``` bash
cd backend
npm ci --omit=dev
```

If tests/build steps require dev dependencies, run them in CI or before
pruning according to the team's release pipeline.

Restart:

``` bash
pm2 restart etms-api
```

Verify:

``` bash
pm2 status
pm2 logs etms-api --lines 100
```

------------------------------------------------------------------------

# 51. Production Frontend Deployment

``` bash
cd /var/www/etms/frontend
npm ci
npm run build
```

Verify build output and Nginx serving path.

For safer deployments, build in CI or a release directory and switch the
`current` symlink only after the build succeeds.

------------------------------------------------------------------------

# 52. Production Smoke Test

Immediately test:

``` text
Frontend loads
API health works
Login works
Current user works
Projects load
Tasks load
Create/update critical workflow works
Dashboard loads
Logout works
```

Inspect:

``` bash
pm2 logs etms-api
sudo tail -f /var/log/nginx/error.log
```

Do not declare deployment successful only because PM2 says `online`.

------------------------------------------------------------------------

# PART X -- CORS

# 53. Environment-Specific CORS

Development:

``` text
http://localhost:5173
```

UAT:

``` text
https://uat.example.com
```

Production:

``` text
https://app.example.com
```

Backend conceptual configuration:

``` js
const allowedOrigins = [
  process.env.FRONTEND_URL
];
```

Avoid unrestricted production CORS unless the API is intentionally
public and designed for it.

------------------------------------------------------------------------

# PART XI -- FIREWALL & PORTS

# 54. Public Ports

Normally expose:

``` text
22   SSH
80   HTTP
443  HTTPS
```

The backend application port:

``` text
5000
```

should normally be reachable only locally/internal network when Nginx is
the public reverse proxy.

Example UFW baseline:

``` bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Confirm SSH access before enabling firewall rules on a remote server.

------------------------------------------------------------------------

# PART XII -- LOGGING & MONITORING

# 55. PM2 Logs

``` bash
pm2 logs etms-api
```

Do not allow logs to grow indefinitely.

Configure rotation/retention appropriate to the server and compliance
requirements.

------------------------------------------------------------------------

# 56. Nginx Logs

Access:

``` text
/var/log/nginx/access.log
```

Errors:

``` text
/var/log/nginx/error.log
```

Useful:

``` bash
sudo tail -f /var/log/nginx/error.log
```

------------------------------------------------------------------------

# 57. Application Logging

Production application logs should include useful structured context
such as:

``` text
requestId
timestamp
level
route
status
duration
error code
```

Never log:

``` text
passwords
access tokens
refresh tokens
Authorization headers
database credentials
private secrets
```

Follow Document 09.

------------------------------------------------------------------------

# 58. Monitoring Targets

Monitor:

``` text
server CPU
memory
disk
PM2 process state
API response failures
Nginx 4xx/5xx patterns
MongoDB Atlas metrics
certificate expiry/renewal
disk/log growth
```

Future production maturity can add centralized application
performance/error monitoring.

------------------------------------------------------------------------

# PART XIII -- ENVIRONMENT VARIABLE MATRIX

# 59. Backend Variables

Example matrix:

  Variable               Development   UAT       Production
  ---------------------- ------------- --------- ------------
  `NODE_ENV`             development   uat       production
  `PORT`                 5000          5001      5000
  `MONGODB_URI`          Dev DB        UAT DB    Prod DB
  `JWT_ACCESS_SECRET`    Dev           UAT       Prod
  `JWT_REFRESH_SECRET`   Dev           UAT       Prod
  `FRONTEND_URL`         localhost     UAT URL   Prod URL
  `LOG_LEVEL`            debug         info      info

Actual variables must match the application implementation.

------------------------------------------------------------------------

# 60. Frontend Variables

  Variable              Development     UAT       Production
  --------------------- --------------- --------- ------------
  `VITE_API_BASE_URL`   localhost API   UAT API   Prod API
  `VITE_APP_ENV`        development     uat       production

Do not store private secrets in frontend variables.

------------------------------------------------------------------------

# PART XIV -- ROLLBACK

# 61. Why Rollback Is Required

Production releases can fail because of:

``` text
application defect
dependency problem
configuration error
database incompatibility
unexpected integration behavior
```

Every production release must have a rollback plan.

------------------------------------------------------------------------

# 62. Backend Rollback

If previous release was:

``` text
v1.0.0
```

and `v1.1.0` fails:

``` bash
cd /var/www/etms
git fetch --tags
git checkout v1.0.0

cd backend
npm ci --omit=dev
pm2 restart etms-api
```

Then verify health and critical flows.

------------------------------------------------------------------------

# 63. Frontend Rollback

With release directories:

``` text
releases/
├── v1.0.0/
└── v1.1.0/

current -> v1.1.0
```

Rollback can switch:

``` text
current -> v1.0.0
```

and reload Nginx if required.

This is safer than rebuilding old frontend source during an incident.

------------------------------------------------------------------------

# 64. Database Rollback Consideration

Application rollback does not automatically reverse database changes.

Schema/data migrations must be:

``` text
backward-compatible where possible
reviewed
backed up
tested in UAT
accompanied by a recovery strategy
```

For MongoDB schema evolution, avoid deployments where the new code
immediately transforms data in a way that makes the previous release
unusable unless a deliberate migration/rollback plan exists.

------------------------------------------------------------------------

# PART XV -- DEPLOYMENT SECURITY

# 65. Production Security Checklist

-   [ ] HTTPS enabled
-   [ ] HTTP redirects to HTTPS
-   [ ] Production DB isolated
-   [ ] Atlas network access restricted
-   [ ] Application DB user uses least privilege
-   [ ] Backend port not unnecessarily public
-   [ ] Secrets not committed
-   [ ] `.env` permissions restricted
-   [ ] PM2 runs as deployment user
-   [ ] Nginx configuration tested
-   [ ] CORS restricted
-   [ ] Authentication enabled
-   [ ] Authorization enabled
-   [ ] Upload limits configured
-   [ ] Security headers reviewed
-   [ ] Logs contain no secrets
-   [ ] Backup/recovery strategy verified
-   [ ] SSH access controlled

------------------------------------------------------------------------

# 66. Environment File Permissions

Example:

``` bash
chmod 600 /var/www/etms/backend/.env
```

Ensure the runtime deployment user can read it while unnecessary users
cannot.

Do not place production secrets in frontend directories.

------------------------------------------------------------------------

# PART XVI -- DEPLOYMENT RESPONSIBILITIES

# 67. Intern Responsibilities

Interns may:

``` text
prepare deployment-ready code
maintain environment examples
fix UAT defects
verify their module
write deployment notes
support regression testing
```

Interns should not independently:

``` text
modify production secrets
change production DNS
open firewall ports
deploy unreviewed commits
alter production database data manually
```

unless explicitly authorized.

------------------------------------------------------------------------

# 68. Technical Lead / DevOps Responsibilities

Lead responsibilities include:

``` text
release approval
server configuration
production secrets
Nginx
SSL
PM2
Atlas production access
production deployment
rollback decision
monitoring
incident coordination
```

------------------------------------------------------------------------

# PART XVII -- DEPLOYMENT CHECKLISTS

# 69. Pre-UAT Checklist

-   [ ] Feature PRs merged into `develop`
-   [ ] Release branch created
-   [ ] Unit tests pass
-   [ ] API tests pass
-   [ ] Integration tests pass
-   [ ] Frontend build passes
-   [ ] UAT environment variables verified
-   [ ] UAT database selected
-   [ ] UAT DNS/SSL valid
-   [ ] PM2 process configured
-   [ ] Nginx configuration valid

------------------------------------------------------------------------

# 70. Pre-Production Checklist

-   [ ] UAT accepted
-   [ ] Release PR approved
-   [ ] Production tag/commit identified
-   [ ] Production environment variables verified
-   [ ] Production Atlas connectivity verified
-   [ ] Backup/recovery readiness confirmed
-   [ ] Nginx config backed up/reviewed
-   [ ] SSL valid
-   [ ] PM2 startup configured
-   [ ] Rollback version identified
-   [ ] Deployment window approved
-   [ ] Team informed

------------------------------------------------------------------------

# 71. Post-Production Checklist

-   [ ] Frontend returns 200
-   [ ] API health returns success
-   [ ] PM2 process online
-   [ ] No startup errors
-   [ ] Login works
-   [ ] Authorization works
-   [ ] Critical CRUD flow works
-   [ ] Dashboard works
-   [ ] MongoDB operations work
-   [ ] Nginx error log checked
-   [ ] Application logs checked
-   [ ] SSL verified
-   [ ] Release recorded
-   [ ] Monitoring observed after deployment

------------------------------------------------------------------------

# PART XVIII -- TROUBLESHOOTING

# 72. Nginx 502 Bad Gateway

Check:

``` bash
pm2 status
pm2 logs etms-api
```

Verify backend locally:

``` bash
curl http://127.0.0.1:5000/health
```

Check Nginx:

``` bash
sudo nginx -t
sudo tail -n 100 /var/log/nginx/error.log
```

Typical causes:

``` text
backend stopped
wrong proxy port
backend startup failure
environment variable missing
```

------------------------------------------------------------------------

# 73. React Route Returns 404

Ensure SPA fallback:

``` nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Then:

``` bash
sudo nginx -t
sudo systemctl reload nginx
```

------------------------------------------------------------------------

# 74. CORS Error

Verify:

``` text
frontend origin
FRONTEND_URL
backend CORS configuration
HTTPS vs HTTP
domain spelling
```

Do not fix production CORS by automatically changing it to allow every
origin.

------------------------------------------------------------------------

# 75. MongoDB Connection Failure

Check:

``` text
MONGODB_URI
Atlas database user
password encoding
network access
server IP
database permissions
DNS/network connectivity
```

Inspect backend logs without printing credentials.

------------------------------------------------------------------------

# 76. SSL Generation Failure

Check:

``` text
DNS points to server
port 80 reachable
Nginx server_name correct
firewall permits HTTP/HTTPS
domain resolves publicly
```

Then retry Certbot only after correcting the underlying issue.

------------------------------------------------------------------------

# 77. PM2 App Keeps Restarting

Inspect:

``` bash
pm2 logs etms-api
pm2 describe etms-api
```

Common causes:

``` text
missing environment variable
database connection failure
port conflict
syntax/runtime error
wrong script path
incompatible Node version
```

------------------------------------------------------------------------

# PART XIX -- RECOMMENDED DEPLOYMENT AUTOMATION

# 78. CI/CD Evolution

Initial deployment can be controlled manually.

Future pipeline:

``` text
Push / Merge
    ↓
Install
    ↓
Lint
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Build
    ↓
Package Artifact
    ↓
Deploy UAT
    ↓
Approval
    ↓
Deploy Production
    ↓
Smoke Test
```

Production deployment should require an approval gate.

------------------------------------------------------------------------

# 79. Artifact-Based Deployment

A mature deployment should prefer tested artifacts rather than
rebuilding arbitrary source directly on production.

Example:

``` text
CI
 ↓
Test backend
Build frontend
Package release
 ↓
UAT
 ↓
Approve same release
 ↓
Production
```

This reduces differences between UAT and Production.

------------------------------------------------------------------------

# PART XX -- COMPLETE ENVIRONMENT FLOW

# 80. Development

``` text
Developer
   ↓
Feature Branch
   ↓
React localhost
   ↓
Node localhost
   ↓
Development MongoDB
```

------------------------------------------------------------------------

# 81. UAT

``` text
release/x.y.z
      ↓
UAT Server
      ↓
Nginx + SSL
      ↓
React UAT
      ↓
PM2 Node API
      ↓
MongoDB Atlas UAT
      ↓
QA / Business Acceptance
```

------------------------------------------------------------------------

# 82. Production

``` text
Approved Release
      ↓
main + Version Tag
      ↓
Production Server
      ↓
Nginx + HTTPS
      ↓
React Production Build
      ↓
PM2 Node API
      ↓
MongoDB Atlas Production
      ↓
Monitoring
```

------------------------------------------------------------------------

# 83. Final Deployment Architecture

``` text
                         USERS
                           │
                           ▼
                    HTTPS / 443
                           │
                           ▼
                 ┌─────────────────┐
                 │      NGINX      │
                 │ SSL + Routing   │
                 └───────┬─────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
 ┌─────────────────┐           ┌─────────────────┐
 │ React Frontend  │           │ Node.js API     │
 │ Vite dist/      │           │ Express + PM2   │
 └─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  MongoDB Atlas   │
                              │ Production DB    │
                              └──────────────────┘
```

------------------------------------------------------------------------

# 84. Definition of Done -- Deployment

A release is deployed only when:

``` text
approved source/tag selected
environment variables verified
dependencies installed deterministically
frontend built successfully
backend running under PM2
Nginx configuration valid
HTTPS valid
database connectivity verified
smoke tests passed
logs reviewed
rollback path available
release recorded
```

A successful command execution alone is not a successful deployment.

------------------------------------------------------------------------

# 85. Conclusion

The ETMS deployment lifecycle is:

``` text
DEVELOPMENT
     ↓
Build + Test
     ↓
UAT
     ↓
QA + Business Acceptance
     ↓
Release Approval
     ↓
PRODUCTION
     ↓
Smoke Test + Monitoring
```

The infrastructure responsibilities are:

``` text
MongoDB Atlas → Managed data storage
PM2           → Node.js process management
Nginx         → Reverse proxy + static frontend
SSL           → Encrypted HTTPS communication
Environment   → Environment-specific configuration
Git Releases  → Traceable deployable versions
```

The most important deployment rule is:

> **Production must never be treated as another development
> environment.**

Every production change must be reviewed, tested in UAT, deployed from
an identifiable release, verified after deployment, and have a rollback
path.
