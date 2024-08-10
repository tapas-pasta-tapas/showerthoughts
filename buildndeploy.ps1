# Load environment variables from .env file
$envVars = Get-Content .env.production | Where-Object { $_ -notmatch '^#' -and $_ -notmatch '^\s*$' } | ForEach-Object { $_.Trim() }
$envVarsString = ($envVars -join ',').Replace("`n", ",").Replace("`r", "")

# Define variables
$IMAGE_NAME = "gcr.io/sonorous-earth-430515-u7/showerthoughts"
$PROJECT = "sonorous-earth-430515-u7"
$SERVICE_NAME = "showerthoughts"
$REGION = "us-central1"
$PORT = 8080
$CPU = 1
$MEMORY = "512Mi"
$CONCURRENCY = 80
$TIMEOUT = 300
$SERVICE_ACCOUNT = "736870137403-compute@developer.gserviceaccount.com"

# Step 1: Build the Docker image
Write-Host "Building Docker image..."
docker build -t $IMAGE_NAME .

# Step 2: Push the Docker image to Google Container Registry
Write-Host "Pushing Docker image to Google Container Registry..."
docker push $IMAGE_NAME

# Step 3: Deploy to Google Cloud Run
Write-Host "Deploying to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME `
  --project $PROJECT `
  --image $IMAGE_NAME `
  --platform managed `
  --region $REGION `
  --port $PORT `
  --cpu $CPU `
  --memory $MEMORY `
  --concurrency $CONCURRENCY `
  --timeout $TIMEOUT `
  --service-account $SERVICE_ACCOUNT `
  --set-env-vars $envVarsString

Write-Host "Deployment completed."
