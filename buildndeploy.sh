#!/bin/bash

# Load environment variables from .env file
set -o allexport
source .env
set -o allexport

# Define variables
IMAGE_NAME=gcr.io/sonorous-earth-430515-u7/showerthoughts
PROJECT=sonorous-earth-430515-u7
SERVICE_NAME=showerthoughts
REGION=us-central1
PORT=8080
CPU=1
MEMORY=512Mi
CONCURRENCY=80
TIMEOUT=300
SERVICE_ACCOUNT=736870137403-compute@developer.gserviceaccount.com

# Construct the --set-env-vars parameter from the .env file
ENV_VARS=$(grep -v '^#' .env | xargs | sed 's/ /,/g')

# Step 1: Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Step 2: Push the Docker image to Google Container Registry
echo "Pushing Docker image to Google Container Registry..."
docker push $IMAGE_NAME

# Step 3: Deploy to Google Cloud Run
echo "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --project $PROJECT \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --port $PORT \
  --cpu $CPU \
  --memory $MEMORY \
  --concurrency $CONCURRENCY \
  --timeout $TIMEOUT \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars $ENV_VARS

echo "Deployment completed."
