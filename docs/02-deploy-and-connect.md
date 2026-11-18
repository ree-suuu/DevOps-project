# 02 - Deploy, Verify & Manage Your Live Full-Stack Server

After configuring your GitHub repository secrets ([01 - Set Up Secrets & Database](01-setup-github-secrets.md)), you are ready to deploy your complete full-stack website!

---

## 1. Trigger the Deployment

### Deploy via Git Push
Whenever you push new code to the `main` branch, GitHub Actions automatically deploys:

```bash
git add .
git commit -m "feat(hosting): full-stack AWS EC2 deployment with CloudFormation, Nginx and PM2"
git push origin main
```

### Deploy Manually from GitHub
1. Open your repository on GitHub.
2. Go to the **Actions** tab.
3. Select **Deploy Web Application (CloudFormation + SSH)** on the left.
4. Click **Run workflow** → Select `main` branch → Click **Run workflow**.

---

## 2. What Happens During Deployment

1. **Build Job (GitHub Runner)**:
   - Installs frontend packages (`npm ci`).
   - Injects `VITE_API_URL=/api` so all frontend requests route through Nginx.
   - Builds the production bundle (`dist/`).
   - Uploads `dist/` as an artifact.

2. **Deploy Job (AWS EC2)**:
   - Authenticates to AWS via `aws-actions/configure-aws-credentials` (including session token support).
   - Provisions or updates the CloudFormation stack (`klay-fullstack-stack`): creates the EC2 instance, security group, and key pair.
   - If the instance was stopped by an AWS lab timer, the workflow starts it and waits for it to become healthy.
   - Dynamically downloads the private SSH key from AWS Systems Manager (SSM) Parameter Store.
   - Transfers the complete project bundle including pre-compiled frontend assets.
   - Connects via SSH (`appleboy/ssh-action`) to:
     - Install backend dependencies (`npm ci --omit=dev`).
     - Write the production `/var/www/app/backend/.env` with MongoDB URI, Port, and JWT secret.
     - Configure Nginx reverse proxy (Port 80 for frontend, `/api/` to port 5000, and SPA routing).
     - Start or reload the Node.js backend using **PM2** (`ecosystem.config.cjs`).
   - Prints the live website URL!

---

## 3. Verify Your Live Deployment

At the end of the deployment run:
- Expand the **Print Live Web Application URL** step in the GitHub Actions log (or check the summary page).
- Click on your website link:
  ```
  http://<EC2_PUBLIC_IP>
  ```
- Test your backend API health check endpoint:
  ```
  http://<EC2_PUBLIC_IP>/api/health
  ```
  It should respond with:
  ```json
  {"status":"healthy","timestamp":"..."}
  ```

---

## 4. SSH into Your EC2 Instance & Useful Commands

You can connect to your server using the private key stored in SSM Parameter Store:

```bash
# 1. Download private key
SSM_PATH=$(aws cloudformation describe-stacks \
  --stack-name klay-fullstack-stack \
  --query "Stacks[0].Outputs[?OutputKey=='SSMKeyPath'].OutputValue" \
  --output text --region us-east-1)

aws ssm get-parameter --name "$SSM_PATH" --with-decryption \
  --query Parameter.Value --output text --region us-east-1 > /tmp/server-key.pem
chmod 400 /tmp/server-key.pem

# 2. Connect via SSH (Username is ubuntu)
ssh -i /tmp/server-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

### Essential Server Commands (Once Connected)

```bash
# Check running PM2 Node.js backend processes:
pm2 status

# View live backend logs (errors, API requests, database connections):
pm2 logs --lines 50

# Restart backend process:
pm2 restart klay-backend --update-env

# View live Nginx web server access logs:
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs:
sudo tail -f /var/log/nginx/error.log

# View cloud-init first boot log:
sudo cat /var/log/userdata.log
```

---

## 5. Handling AWS Academy Lab Expirations

In AWS Academy / VocLabs, lab environments stop after 4 hours:
1. When your lab stops, start it again in AWS Academy.
2. Click **AWS Details** → **Show** and copy the new `[default]` credentials.
3. Update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` in your GitHub Repository Secrets.
4. Go to **Actions** in GitHub and click **Re-run all jobs**.
5. The workflow automatically recovers your EC2 instance, restarts services, and brings your site back online within 60 seconds!
