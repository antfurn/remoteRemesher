@echo off
rem remoteRemesher :: Git pull -> docker [ build, remove old, start ]
echo remoteRemesher :: Git pull -> docker [ build, remove old, start ]

rem Get latest code
echo Doing:: git pull
git pull

rem Docker: build remoteRemesher container
echo Doing:: docker build
docker build -t antfurn/remoteRemesher .

rem Docker: stop/remove old container
echo Doing:: stop/remove old container
docker ps -a
docker stop remoteRemesher
docker rm remoteRemesher

rem Docker: start remoteRemesher container
echo Doing:: docker run
docker run -p 9979:9979 -d -v C:\PerDev\Download:/usr/src/app/remoteRemesher --name remoteRemesher antfurn/remoteRemesher

