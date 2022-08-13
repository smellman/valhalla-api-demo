# routing demo

## setup

```bash
yarn
```

## requirement

server: docker, docker compose plugin

```bash
sudo apt install docker.io
sudo usermod -aG docker $USER
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.7.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

## install depends service

### tileserver

Download `planet-{date}.mbtiles` from https://file.smellman.org/

```bash
git clone https://github.com/osmfj/tileserver-gl-site.git
cd tileserver-gl-site
docker compose build
cd data
cp ~/planet-20220725.mbtiles planet.mbtiles
cd ..
docker compose up -d
```

You can access http://localhost:8000

### valhalla

```bash
sudo apt install aria2
git clone https://github.com/smellman/valhalla-docker-scripts.git
cd valhalla-docker-scripts
aria2c https://planet.openstreetmap.org/pbf/planet-220725.osm.pbf.torrent
# When download finished, run Ctrl+C
docker run --rm -u `id -u`:`id -g` -e PBF_FILE=planet-220725.osm.pbf -v ${PWD}:/srv valhalla/valhalla:run-latest /srv/run_valhalla_all.sh
docker run --rm -it -u `id -u`:`id -g` -p 8002:8002 -v ${PWD}:/srv valhalla/valhalla:run-latest /srv/run_valhalla_api.sh
```

## running in production

TBD...

## running in localhost

```bash
ssh -L 8000:your-server-ip:8000 -L 8002:your-server-ip:8002 your-user@your-server-ip
```

```bash
yarn run start
```
