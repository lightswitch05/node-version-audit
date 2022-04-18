ARG NODE_IMAGE_TAG
FROM node:${NODE_IMAGE_TAG} as builder
WORKDIR /opt/node-version-audit
COPY ./docker/docker-entrypoint.sh ./docker/docker-entrypoint.sh
ADD ./package-lock.json .
ADD ./package.json .
ADD ./lib ./lib/
ADD ./bin ./bin/
ADD ./docs/rules-v1.json ./docs/
RUN npm install

FROM node:${NODE_IMAGE_TAG}
WORKDIR /opt/node-version-audit
ENV NVA_REQUIRE_VERSION_ARG=true
COPY --from=builder /opt/node-version-audit /opt/node-version-audit
ENTRYPOINT ["/opt/node-version-audit/docker/docker-entrypoint.sh"]
