# Developer's Guide
There are multiple ways to run the Spatial imagery tool. Here are a few options to get you started.

## Option 1: Local Use and Development
 We recommend this option if you are going to change the application's code or use it only on your own computer and are comfortable with Javascript.

 This project uses [Parcel](https://parceljs.org/) to run development servers and build packages for [a web app](https://parceljs.org/getting-started/webapp/). The following instructions detail how to use Parcel with Node.js/npm for this project. For convenience, we have also provided the script `start.sh` which includes all these steps.

### Dependencies
For development on the Spatial Labeling tool, install [Node.js](https://nodejs.org/en/) and the [Node Package Manager (npm)](https://docs.npmjs.com/) by following the [installation instructions in the npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). You should should also have python 3.11 available in a virtual environment.

### Local Installation
From the root of this repository, run `npm install` from the console to install the web application dependencies. 

You must also install the Titiler service which hosts the GeoTIFF map images via python dependencies by running `pip install -r requirements.txt`. The application has been tested with python 3.11, and we recommend using a python 3.11 virtual environment.

### Starting the Tiling Service
The tiling service can be started by running `uvicorn titiler.application.main:app --host 0.0.0.0 --port 8888`.


### Development Server
You can start a development server at localhost:1234 by running `npm start`. This is recommended for development, because any code changes will be automatically reloaded on the running website. 

### Bundle for Web Server
To bundle and optimize code for production, run `npm run build`, which packages optimized code for a web server, creating the files in a `dist` folder. The files in `dist` are ready to be hosted on a simple web server, for example in [nginx](https://www.nginx.com/).



### Cleaning
If you change the Parcel or Node configurations, you may want to clean up artifacts by running `npm run clean` to remove the `dist` and `.parcel-cache` folders.

## Option 2: Run the application in a Docker Container
With a Docker image, you can use pre-built code to run the application in a container, so the only dependency you need to worry about is Docker. You can also use Docker images to run the application using [Azure Container Instances (ACI)](https://azure.microsoft.com/en-us/products/container-instances) or [Amazon Elastic Container Services (ECS)](https://aws.amazon.com/ecs/).

We recommend this option if you don't know Javascript well or would like to make the application available to others with a particular configuration.

### Dependencies
You should install either [Docker Desktop](https://docs.docker.com/desktop/) or [Docker Engine](https://docs.docker.com/engine/) to get the Docker Command Line Interface.

For a more thorough explanation of working with Node.js projects using Docker, see [Docker Docs](https://docs.docker.com/language/nodejs/run-containers/).

### Build Image from Source Code
The `Dockerfile` in the root of this repository defines how to build and run the web application in a container. To build a Docker image named `satellite-imagery-labeling-tool` using the source code in this repository, navigate to the same folder as the `Dockerfile`, then run `docker build --tag satellite-imagery-tool .`. This will create an image named `satellite-imagery-tool` and automatically tagged as `latest`.
When you run this command, you should see several steps followed by a success message with the image ID and name:
```
$ docker build --tag satellite-imagery-labeling-tool .
Sending build context to Docker daemon  293.5MB
Step 1/8 : FROM node:19
 ---> 3d8ab8fd7e2a
Step 2/8 : WORKDIR /satellite-imagery-labeling-tool
 ---> Using cache
 ---> 20e31b7527c0
Step 3/8 : COPY ["package.json", "package-lock.json*", "./"]
 ---> Using cache
 ---> 22b62b75b2f8
Step 4/8 : RUN npm install .
 ---> Using cache
 ---> 8555a978b519
Step 5/8 : COPY src src
 ---> Using cache
 ---> 8aacd2f17fc7
Step 6/8 : COPY docs docs
 ---> e95c03b91e49
Step 7/8 : EXPOSE 1234
 ---> Running in a90054da42ec
Removing intermediate container a90054da42ec
 ---> 687583dc9775
Step 8/8 : CMD ["npm", "start"]
 ---> Running in 4ca57c2d6d6a
Removing intermediate container 4ca57c2d6d6a
 ---> a6bb8ad1972a
Successfully built a6bb8ad1972a
Successfully tagged satellite-imagery-labeling-tool:latest

```

You can see the image you created by running `docker image ls`:
```
$ docker image ls
REPOSITORY                        TAG       IMAGE ID       CREATED          SIZE
satellite-imagery-labeling-tool   latest    a6bb8ad1972a   14 minutes ago   1.32GB
```

If you are running into errors building the container, you may want to double check your image platform. Build the container using the `--platform linux/amd64` or `--platform linux/arm64` flag. See [Docker Multi-platform images](https://docs.docker.com/build/building/multi-platform/) for more details.

### Pull a Pre-built Image from DockerHub
Pre-built images are uploaded to the [umasscds/satellite-imagery-labeling-tool DockerHub repository](https://hub.docker.com/r/umasscds/satellite-imagery-labeling-tool). Instructions for pulling and running the image are on also DockerHub. DockerHub images are created automatically using GitHub actions each time a version tag (starting with '.v') is added in this GitHub repo.

### Run Container
Once you have built or pulled your desired image, you can run it in a container.

Because the application in the container will be exposed on port 1234 and the tiling service is on port 8888, we need to publish the container's ports to the ports on our host machine using the `-p, --publish` flag. See [this article](https://www.mend.io/free-developer-tools/blog/docker-expose-port/) for a detailed description on working with ports. We will use the `-d, --detach` flag to start a container in "detached mode", so the only output will be the container ID.
```
$ docker run -d -p 1234:1234 -p 8888:8888 satellite-imagery-labeling-tool
b1d36e19e77c38547a7f201809e9fa3b7dccb7424a0eeabe471be675cd7bec9e
```

Your application will now be available by opening http://localhost:1234 in your browser.

You can see which containers are currently running and their ports using the `docker ps` command:
```
CONTAINER ID   IMAGE                                  COMMAND                  CREATED              STATUS              PORTS                                            NAMES
b1d36e19e77c   satellite-imagery-labeling-tool:test   "/bin/sh -c ./start.…"   About a minute ago   Up About a minute   0.0.0.0:1234->1234/tcp, 0.0.0.0:8888->8888/tcp   interesting_grothendieck
```

Once you're finished with the application, stop it by running `docker stop <your container id>`.

### Specifying Azure Maps Subscription Key for Container
To enable Azure Maps when running the application in a Docker container, set the `AZURE_MAPS_SUBSCRIPTION_KEY` environment variable using the `--env` flag for the `docker run` command as follows:
```
docker run --env AZ_MAPS_SUBSCRIPTION_KEY="<your subscription key here>" -d -p 1234:1234 -p 8888:8888 satellite-imagery-labeling-tool
```

More details about Azure Maps enabling Azure maps are found in the(Imagery Layers documentation)[Layers.md].

### Specifying SAS keys for accessing blobs
In order to read from and write to Azure storage, add the three environment variables using `--env`, just as described in the last section:
```
docker run --env AZ_STORAGE_ACCOUNTNAME="<your storage account name>" --env AZ_STORAGE_CONTAINERNAME="<your container name>" --env AZ_STORAGE_SASTOKEN="<your account SAS token>" -d -p 1234:1234 -p 8888:8888 satellite-imagery-labeling-tool
```
You can generate your SAS token on Azure portal, navigate to "Storage Account-[your storage account]-Containers-[your container]-Shared access tokens". There you can generate an account SAS and set the expiry date, note that once you generate it, it cannot be revoked, so keep it safe by following the Microsoft recommended best [practice](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview#best-practices-when-using-sas)!