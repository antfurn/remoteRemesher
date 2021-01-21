#!/usr/bin/env bash

docker run -p 9979:9979 -d -v /srv/1f01824a-8109-40e5-a266-3d6f78db3b02/Data/NAS/FreeForAll/Nomad:/usr/src/app/remoteRemesher -v /etc/localtime:/etc/localtime:ro --name remoteRemesher antfurn/remote-remesher