FROM node:16-bullseye as base

RUN apt-get update && apt upgrade -y
# Download mage
RUN apt install golang-go -y
RUN git clone https://github.com/magefile/mage && cd mage && mkdir -p /root/go/bin && go run bootstrap.go && export PATH=$PATH:/root/go/bin/ 

WORKDIR /home/cosmos-grafana-plugins
COPY . .
RUN chmod +x ./build_plugins.sh
RUN ./build_plugins.sh true
