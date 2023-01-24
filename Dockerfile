FROM node:16-bullseye as base

RUN apt-get update && apt upgrade -y
# Download mage
WORKDIR /usr/local
RUN curl -OL https://go.dev/dl/go1.19.5.linux-amd64.tar.gz && tar -C /usr/local -xzf go1.19.5.linux-amd64.tar.gz
ENV PATH="$PATH:/usr/local/go/bin/"
ENV GOBIN="/usr/local/go/bin"
WORKDIR /home
RUN git clone https://github.com/magefile/mage
WORKDIR /home/mage
RUN go run bootstrap.go

WORKDIR /home/cosmos-grafana-plugins
COPY . .
RUN chmod +x ./build_plugins.sh
RUN ./build_plugins.sh --cleanup
