# Define custom function directory
ARG FUNCTION_DIR="/function"

#FROM node:18-buster as build-image
FROM node:18-buster

# Include global arg in this stage of the build
ARG FUNCTION_DIR

# Install puppeteer dependencies
RUN apt-get update \
   &&  apt-get install -y wget gnupg \
   &&  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
   &&  sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
   &&  apt-get update \
   &&  apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 --no-install-recommends \
   &&  service dbus start \
   &&  rm -rf /var/lib/apt/lists/* \
   &&  groupadd -r pptruser \
   &&  useradd -rm -g pptruser -G audio,video pptruser

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY . ${FUNCTION_DIR}

WORKDIR ${FUNCTION_DIR}

# Install Node.js dependencies
RUN npm install

# Grab a fresh slim copy of the image to reduce the final size
#FROM node:18-buster-slim

# Required for Node runtimes which use npm@8.6.0+ because
# by default npm writes logs under /home/.npm and Lambda fs is read-only
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Include global arg in this stage of the build
#ARG FUNCTION_DIR

# Set working directory to function root directory
#WORKDIR ${FUNCTION_DIR}

# Copy in the built dependencies
#COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

# Start app
CMD ["node", "app.js"]

# External port
EXPOSE 3000