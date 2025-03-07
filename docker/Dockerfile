ARG NODE_IMAGE_TAG
FROM scratch AS files
WORKDIR /opt/node-version-audit
# none of these files change often
ADD ./lib ./lib/
ADD ./bin ./bin/

FROM node:${NODE_IMAGE_TAG} AS builder
ENV NODE_ENV=production
WORKDIR /opt/node-version-audit
ADD ./package-lock.json .
ADD ./package.json .
RUN npm ci --omit=dev

FROM node:${NODE_IMAGE_TAG}
WORKDIR /opt/node-version-audit
ENV NVA_REQUIRE_VERSION_ARG=true
ENV NODE_ENV=production
COPY ./docker/docker-entrypoint.sh ./docker/docker-entrypoint.sh
ENTRYPOINT ["/opt/node-version-audit/docker/docker-entrypoint.sh"]
COPY --link --from=builder /opt/node-version-audit /opt/node-version-audit
COPY --link --from=files /opt/node-version-audit /opt/node-version-audit
# this is the only file that changes regularly
COPY ./docs/rules-v1.json ./docs/
