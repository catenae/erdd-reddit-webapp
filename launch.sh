#!/bin/bash
docker rm -f catenae

docker run --restart unless-stopped -tid --net=host \
-v "$(pwd)"/src:/var/www/html \
--name catenae \
catenae/web-app
