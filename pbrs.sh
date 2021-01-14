#!/usr/bin/env bash

# remoteRemesher :: Git pull -> docker [ build, remove old, start ]
echo remoteRemesher :: Git pull -> docker [ build, remove old, start ]

# Get latest code
echo Doing:: git pull
git pull

# Docker: build remoteRemesher container
echo Doing:: docker build
. build.sh

# Docker: stop/remove old container
echo Doing:: stop/remove old container
docker ps -a
docker stop remoteRemesher
docker rm remoteRemesher

# Docker: start remoteRemesher container
echo Doing:: docker run
. start.sh

