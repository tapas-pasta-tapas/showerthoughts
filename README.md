# showerthoughts

An AI journaling app, with the key feature of a completion similar to copilot, but offering reflective questions instead based on what you have reflected on so far. Like copilot, you can press tab to add those questions to your journaling entry.

## Setting up
1. Clone the repository
2. Run `yarn install` & `yarn generate`
3. Run `yarn dev`
4. Access the dev build at `localhost:3000`

## Using the APIs
API documentation can be found in the `app/api` folder

## Deployment on gloud
1. Execute permissions for unix-like OS: `chmod +x ./buildndeploy.sh`
2. gloud login: `gcloud auth login`
3. docker config for gcloud: `gcloud auth configure-docker`
4. Run the script: 
  - Windows: `./buildndeploy.ps1`
  - Unix-like OS: `bash buildndeploy.sh`
