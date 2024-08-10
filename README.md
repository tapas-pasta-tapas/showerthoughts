# showerthoughts

An AI journaling app, with the key feature of a completion similar to copilot, but offering reflective questions instead based on what you have reflected on so far. Like copilot, you can press tab to add those questions to your journaling entry.

## Setting up
1. Clone the repository
2. Run `yarn install` & `yarn generate`
3. Run `yarn dev`
4. Access the dev build at `localhost:3000`

## Building with Dockerfile and Deploying to Google Cloud Run

This project is setup to build with Dockerfile, and deploy to Google Cloud Run. For easy build and development, there is already a buildndeploy.ps1 for Windows and buildndeploy.sh for Linux.

Before running the buildndeploy script, make sure you have done the following prerequisites:

1. Install Docker Desktop
2. Install Google Cloud SDK
3. Authenticate with Google Cloud SDK
   Run the following command to authenticate with Google Cloud SDK:

```powershell
gcloud auth login
```

4. Enable Google Cloud Run API
5. Create a Google Cloud Run service
6. Create a Google Cloud Run service account
7. Assign the Google Cloud Run service account the necessary roles
8. Run the following commands to set the docker configuration for Google Cloud Run:

```powershell
gcloud auth configure-docker
```

9. Update the buildndeploy script with your Google Cloud Project ID and Google Cloud Run service name
10. Create a .env file in the root directory and follow the .env.example file to set the necessary environment variables
11. Make the `buildndeploy.sh` script executable.

```sh
chmod +x ./buildndeploy.sh
```

12. Run the buildndeploy script:

For Windows:

```powershell
.\buildndeploy.ps1
```

For Linux:

```bash
./buildndeploy.sh
```