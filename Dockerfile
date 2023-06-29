FROM nikolaik/python-nodejs:latest

WORKDIR /satellite-imagery-labeling-tool

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install .

RUN pip install uvicorn
RUN pip install titiler.core
RUN pip install titiler.application

# Copy folders used in the web service
COPY src src
COPY docs docs
COPY start.sh start.sh

EXPOSE 1234
EXPOSE 8888
RUN chmod +x start.sh
CMD ./start.sh

