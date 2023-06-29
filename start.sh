#!/bin/sh
npm run build
uvicorn titiler.application.main:app --host 0.0.0.0 --port 8888 &
npm start
