# Loading GeoTIFF files as layers

This document details how to load GeoTIFFs as layers in the satellite imagery labeling tool, which will allow the layers to automatically load for annotators.

## Building the docker container

1) Start on the `containerization` branch in the satellite-imagery-labeling-tool repository.
2) Build the docker container:
  ```
  docker build . -t *name of docker*
  ```
3) Run the docker image:
```
docker run -p 8888:8888 -p 1234:1234 -e AZ_MAPS_SUBSCRIPTION_KEY="*key*" *name of image*
```
Note: The web server is on port 1234 and the TTiler service is on port 8888.

## Generating a shared access token

1) Navigate to your storage account in Azure. 
2) Open the container within your storage account that contains the GeoTIFF file that you want to load. 
3) Click on the Shared access tokens option in the Settings tab and leave all variables default. 
4) Click Generate SAS token and URL.
5) Copy and paste the Blob SAS token into a text file to save it.

## Enabling resource sharing
1) Navigate back to your storage account and click the Resource sharing (CORS) option in the Settings tab. 
2) In the Allowed origins tab, enter an asterisk (*) to allow all origins. 
3) In the Allowed methods tab, set the allowed methods to GET. 

## Creating a URL

1) Navigate to your container and click on your GeoTIFF file. 
2) In the Overview tab, copy the URL of the blob. 
3) Paste the URL of the blob into the same text file as your Blob SAS token.
4) Add a question mark (?) to the end of your URL and then copy and paste your Blob SAS token to the end of the URL. This creates a new URL that can be loaded into the labeling tool.

## Adding the TIFF as a layer

1. Open the satellite imagery labeling tool and load your project. 
2. Click the "Add new TIFF Layer" option.
3. Paste your new URL in the TIFF URL option and name your new layer. 
4. Click Add, then click on your new layer. 
5. Download the project file. When an annotator uses this project file to label images, the GeoTIFF layer will be there. 