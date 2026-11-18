# 01 - Set Up Secrets & Database (Frontend, Backend & MongoDB)

To host your full-stack application (React frontend + Express backend + MongoDB database) on AWS EC2, you need to configure your cloud database and add your secrets to your GitHub repository.

---

## Step 1: Set Up Cloud Database (MongoDB Atlas)

Running MongoDB inside a tiny `t2.micro` EC2 instance can easily run out of memory (1GB RAM) and loses data if the server is terminated. MongoDB Atlas M0 is **100% free forever**, runs 24/7, and persists across server restarts.

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and sign up or log in.
2. Create an **M0 Free Cluster** (choose AWS `us-east-1` or your closest region).
3. Under **Security** → **Database Access**:
   - Create a database user (e.g. `klay_admin`) and set a strong password.
   - Assign role **Read and write to any database**.
4. Under **Security** → **Network Access**:
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere (`0.0.0.0/0`)** and confirm.
   *(This ensures your EC2 instance can always connect even if its public IP changes).*
5. Under **Deployments** → **Database** → Click **Connect**:
   - Choose **Drivers** (Node.js).
   - Copy your connection string. It looks like:
     ```
     mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/klay_store?retryWrites=true&w=majority
     ```
   - Replace `<USERNAME>` and `<PASSWORD>` with your actual database credentials.

---

## Step 2: Get Your AWS Credentials

### Option A: AWS Academy / Learner Lab (VocLabs)
1. Start your lab and wait until the indicator turns **green**.
2. Click the **AWS Details** button next to the terminal button.
3. Click **Show** next to AWS CLI.
4. Copy the three values from the `[default]` block:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token` (long string)

> **Note**: AWS Academy session tokens expire after 4 hours. Whenever you start a new lab session, just copy the fresh credentials and update your GitHub repository secrets.

### Option B: Regular AWS Account / IAM User
1. Open the [AWS Console](https://console.aws.amazon.com/) → **IAM** → **Users**.
2. Create an access key under **Security credentials**.
3. Copy `aws_access_key_id` and `aws_secret_access_key` (`aws_session_token` is not needed for standard IAM users).

---

## Step 3: Add Repository Secrets in GitHub

In your GitHub repository, navigate to:
**Settings** → **Secrets and variables** → **Actions** → Click **New repository secret**.

Add the following secrets:

| Secret Name | Value | Purpose |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | `ASIA...` or `AKIA...` | AWS Authentication |
| `AWS_SECRET_ACCESS_KEY` | `xxxx...` | AWS Secret Key |
| `AWS_SESSION_TOKEN` | Long token string (AWS Academy only) | Temporary lab session token |
| `MONGODB_URI` | `mongodb+srv://...` (from Step 1) | Backend database connection |
| `JWT_SECRET` | Any random 32+ character string | Token encryption for user auth |

---

## Step 4: (Optional) Set AWS Region Variable

In **Settings** → **Secrets and variables** → **Actions** → Click the **Variables** tab:
- **`AWS_REGION`**: `us-east-1` (default if omitted)

---

Next Step: [02 - Deploy and Connect](02-deploy-and-connect.md)
