const https = require('https');
const prompt = require('prompt');
const fs = require('fs');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Needed to perform HTTPS requests without certificates.

////////////////////////////////////////////////////////////////////////////////
// HELPER
////////////////////////////////////////////////////////////////////////////////

const CONTENT_TYPES = Object.freeze({
  '.aac': 'audio/aac',
  '.abw': 'application/x-abiword',
  '.arc': 'application/x-freearc',
  '.avi': 'video/x-msvideo',
  '.azw': 'application/vnd.amazon.ebook',
  '.bin': 'application/octet-stream',
  '.bmp': 'image/bmp',
  '.bz': 'application/x-bzip',
  '.bz2': 'application/x-bzip2',
  '.csh': 'application/x-csh',
  '.css': 'text/css',
  '.csv': 'text/csv',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.eot': 'application/vnd.ms-fontobject',
  '.epub': 'application/epub+zip',
  '.gif': 'image/gif',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.ico': 'image/vnd.microsoft.icon',
  '.ics': 'text/calendar',
  '.jar': 'application/java-archive',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript', // NOTE: Updated from source.
  '.json': 'application/json',
  '.jsonld': 'application/ld+json',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mjs': 'application/javascript', // NOTE: Updated from source.
  '.mp3': 'audio/mpeg',
  '.mpeg': 'video/mpeg',
  '.mpkg': 'application/vnd.apple.installer+xml',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.oga': 'audio/ogg',
  '.ogv': 'video/ogg',
  '.ogx': 'application/ogg',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.rar': 'application/x-rar-compressed',
  '.rtf': 'application/rtf',
  '.sh': 'application/x-sh',
  '.svg': 'image/svg+xml',
  '.swf': 'application/x-shockwave-flash',
  '.tar': 'application/x-tar',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.vsd': 'application/vnd.visio',
  '.wav': 'audio/wav',
  '.weba': 'audio/webm',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xhtml': 'application/xhtml+xml',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xml': 'application/xml',
  '.xul': 'application/vnd.mozilla.xul+xml',
  '.zip': 'application/zip',
  '.7z': 'application/x-7z-compressed',
});

const DEFAULT_REQUEST_OPTIONS_KEY = 'MASERATI';

function finalizeRequestOptions({ requestOptions = DEFAULT_REQUEST_OPTIONS_KEY, requestOptionsList } = {}) {
  if (typeof requestOptions === 'string') {
    if (typeof requestOptionsList !== 'object' || requestOptionsList === null) {
      throw new Error('ERROR'); // TODO Finalize error message.
    }

    if (requestOptions in requestOptionsList) {
      requestOptions = requestOptionsList[requestOptions];
    }
  }

  if (typeof requestOptions !== 'object' || requestOptions === null) {
    throw new Error('ERROR'); // TODO Finalize error message.
  }

  if (typeof requestOptions.protocol !== 'string') {
    requestOptions.protocol = 'https:';
  }

  if (typeof requestOptions.host !== 'string') {
    throw new Error('ERROR'); // TODO Finalize error message.
  }

  if (typeof requestOptions.port !== 'number') {
    requestOptions.port = 443;
  }

  if (typeof requestOptions.path !== 'string') {
    throw new Error('ERROR'); // TODO Finalize error message.
  }

  return requestOptions;
}

////////////////////////////////////////////////////////////////////////////////
// AUTH HELPER
////////////////////////////////////////////////////////////////////////////////

const DEFAULT_AUTH_APP = 'cotapp';

const DEFAULT_AUTH_FILEPATH = './sid.txt';

const AUTH_REQUEST_OPTIONS_LIST = Object.freeze({
  MASERATI: {
    protocol: 'https:',
    host: 'config.cc.toronto.ca',
    port: 49090,
    path: '/c3api_auth/v2/AuthService.svc/AuthSet'
  },
  SIT: {
    protocol: 'https:',
    host: 'was-intra-sit.toronto.ca',
    port: 443,
    path: '/c3api_auth/v2/AuthService.svc/AuthSet'
  },
  QA: {
    protocol: 'https:',
    host: 'was-intra-qa.toronto.ca',
    port: 443,
    path: '/c3api_auth/v2/AuthService.svc/AuthSet'
  },
  PROD: {
    protocol: 'https:',
    host: 'insideto-secure.toronto.ca',
    port: 443,
    path: '/c3api_auth/v2/AuthService.svc/AuthSet'
  }
});

function authenticateSid({ requestOptions, sid }) {
  return Promise.resolve()
    // Check requirements.
    .then(() => {
      if (typeof sid !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" argument.
    .then(() => {
      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: AUTH_REQUEST_OPTIONS_LIST });
    })
    // Validate "sid", resolving with user data when valid, reject with error when invalid.
    .then(() => {
      return new Promise((resolve, reject) => {
        const { protocol, host, port } = requestOptions;
        const path = `${requestOptions.path}('${sid}')`;
        const method = 'GET';
        const headers = {
          'Accept': 'application/json'
        };

        console.log(protocol, host, port, path, method);
        const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
          let chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            let data;
            if (chunks.length > 0) {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            }

            // TODO Update when "no_such_session" no longer have the status code of 200.
            if (response.statusCode === 200 && data.error == null) {
              resolve(data);
            } else {
              reject(data);
            }
          });
        });

        request.on('error', (error) => {
          reject(error);
        });

        request.end();
      });
    });
}

function authenticate(authOptions = {}) {
  let { requestOptions, data, sid, filePath = DEFAULT_AUTH_FILEPATH, app = DEFAULT_AUTH_APP, userName, password } = authOptions;

  return Promise.resolve()
    // Finalize "requestOptions" argument.
    .then(() => {
      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: AUTH_REQUEST_OPTIONS_LIST });
    })
    // Accepts data.
    .then(() => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        return data;
      }
    })
    // Validate "sid" when data is invalid.
    .then((data) => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        return data;
      }

      if (typeof sid === 'string') {
        return authenticateSid({ requestOptions, sid })
          .catch((error) => {
            console.error('ERROR', error);
            return error;
          });
      }
    })
    // Read "filePath" for cached "sid" and validate when data is invalid.
    .then((data) => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        return data;
      }

      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        const sid = fs.readFileSync(filePath, 'utf8');
        if (typeof sid === 'string') {
          return authenticateSid({ requestOptions, sid })
            .catch((error) => {
              console.error('ERROR', error);
              return error;
            });
        }
      }
    })
    // Prompt or use "username" and "password" to authenticate when data is invalid.
    .then((data) => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        return data;
      }

      if (typeof userName !== 'string' || typeof password !== 'string') {
        return new Promise((resolve, reject) => {
          const schema = {
            properties: {
              userName: {
                description: 'User Name',
                type: 'string',
                require: true
              },
              password: {
                description: 'Password',
                type: 'string',
                hidden: true,
                require: true
              }
            }
          };

          prompt.start();

          prompt.get(schema, (error, result) => {
            if (error) {
              reject(error);
            } else {
              userName = result.userName;
              password = result.password;
              resolve();
            }
          });
        });
      }
    })
    .then((data) => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        return data;
      }

      if (typeof userName === 'string' || typeof password === 'string') {
        return new Promise((resolve, reject) => {
          const payload = JSON.stringify({
            app,
            user: userName,
            pwd: password
          });

          const { protocol, host, port, path } = requestOptions;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 200) {
                resolve(data);
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.write(payload);

          request.end();
        });
      }
    })
    .then((data) => {
      if (typeof data === 'object' && data !== null && typeof data.sid === 'string') {
        let fileSid;
        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          fileSid = fs.readFileSync(filePath, 'utf8');
        }
        if (fileSid !== data.sid) {
          fs.writeFileSync(filePath, data.sid);
        }

        authOptions.data = data;

        return data;
      }

      throw new Error('ERROR'); // TODO Finalize error message.
    });
}

module.exports.auth = {
  authenticate
};

////////////////////////////////////////////////////////////////////////////////
// CONFIG HELPER
////////////////////////////////////////////////////////////////////////////////

const CONFIG_REQUEST_OPTIONS_LIST = Object.freeze({
  MASERATI: {
    protocol: 'https:',
    host: 'config.cc.toronto.ca',
    port: 49092,
    path: '/c3api_config/v2/ConfigService.svc/ConfigSet'
  },
  SIT: {
    protocol: 'https:',
    host: 'was-intra-sit.toronto.ca',
    port: 443,
    path: '/c3api_config/v2/ConfigService.svc/ConfigSet'
  },
  QA: {
    protocol: 'https:',
    host: 'was-intra-qa.toronto.ca',
    port: 443,
    path: '/c3api_config/v2/ConfigService.svc/ConfigSet'
  },
  PROD: {
    protocol: 'https:',
    host: 'insideto-secure.toronto.ca',
    port: 443,
    path: '/c3api_config/v2/ConfigService.svc/ConfigSet'
  }
});


function configLocalFileToRemote({ requestOptions, localPath, qualifiedName, authOptions = {} }) {
  return Promise.resolve()
    // Check requirements.
    .then(() => {
      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof qualifiedName !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: CONFIG_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Check existing config entry
    .then(() => {
      return new Promise((resolve, reject) => {
        const { protocol, host, port } = requestOptions;
        const pathArg = `${requestOptions.path}('${qualifiedName}')/QualifiedName?$format=application/json;odata.metadata=none`
        const method = 'GET';
        const headers = {
          'Accept': 'application/json',
          'Authorization': `AuthSession ${authOptions.data.sid}`
        };

        console.log(protocol, host, port, pathArg, method);
        const request = https.request({ protocol, host, port, path: pathArg, method, headers }, (response) => {
          let chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            let data;
            if (chunks.length > 0) {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            }

            if (response.statusCode === 200) {
              resolve('PUT');
            } else if (response.statusCode === 404) {
              resolve('POST');
            } else {
              reject(data);
            }
          });
        });

        request.on('error', (error) => {
          reject(error);
        });

        request.end();
      });
    })
    // Turn "localPath" and "qualifiedName" into "json" and upload.
    .then((method) => {
      if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile()) {
        return new Promise((resolve, reject) => {
          const file = fs.readFileSync(localPath, 'base64');
          if (file.length === 0) {
            throw new Error('ERROR'); // TODO Finalize error message.
          }

          const fileExt = path.extname(localPath);
          const contentType = fileExt in CONTENT_TYPES ? CONTENT_TYPES[fileExt] : 'text/plain'

          const payload = JSON.stringify({
            QualifiedName: qualifiedName,
            ConfigContent: file,
            ContentType: contentType
          });

          const { protocol, host, port } = requestOptions;
          const pathArg = method === 'PUT' ? `${requestOptions.path}('${qualifiedName}')` : requestOptions.path;
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          };

          console.log(protocol, host, port, pathArg, method);
          const request = https.request({ protocol, host, port, path: pathArg, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 201) {
                resolve(data);
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.write(payload);

          request.end();
        });
      } else {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    });
}

function configLocalToRemote({ requestOptions, localPath, qualifiedName, authOptions = {} }) {
  return Promise.resolve()
    // Check requirements.
    .then(() => {
      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof qualifiedName !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: CONFIG_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Loop through directories and files.
    .then(() => {
      if (fs.existsSync(localPath)) {
        if (fs.lstatSync(localPath).isDirectory()) {
          const dirContents = fs.readdirSync(localPath);
          const allPromises = [];
          let promiseChain = Promise.resolve();
          for (let index = 0, length = dirContents.length; index < length; index++) {
            promiseChain = promiseChain.then(() => {
              return configLocalToRemote({
                requestOptions,
                localPath: `${localPath}/${dirContents[index]}`,
                qualifiedName: `${qualifiedName}/${dirContents[index]}`,
                authOptions
              })
                .catch((error) => {
                  console.error('ERROR', error);
                  return error;
                });
            });
            allPromises.push(promiseChain);
          }
          return promiseChain.then(() => {
            return Promise.all(allPromises);
          });
        } else if (fs.lstatSync(localPath).isFile()) {
          return configLocalFileToRemote({ requestOptions, localPath, qualifiedName, authOptions })
            .catch((error) => {
              console.error('ERROR', error);
              return error;
            });
        }
      }
    });
}

module.exports.config = {
  localFileToRemote: configLocalFileToRemote,
  localToRemote: configLocalToRemote
};

////////////////////////////////////////////////////////////////////////////////
// DATAACCESS HELPER
////////////////////////////////////////////////////////////////////////////////

const DATAACCESS_REQUEST_OPTIONS_LIST = Object.freeze({
  MASERATI: {
    protocol: 'https:',
    host: 'config.cc.toronto.ca',
    port: 49093,
    path: '/c3api_data/v2/DataAccess.svc'
  },
  SIT: {
    protocol: 'https:',
    host: 'was-intra-sit.toronto.ca',
    port: 443,
    path: '/c3api_data/v2/DataAccess.svc'
  },
  QA: {
    protocol: 'https:',
    host: 'was-intra-qa.toronto.ca',
    port: 443,
    path: '/c3api_data/v2/DataAccess.svc'
  },
  PROD: {
    protocol: 'https:',
    host: 'insideto-secure.toronto.ca',
    port: 443,
    path: '/c3api_data/v2/DataAccess.svc'
  }
});

function daLocalFileToRemote({ requestOptions, app, localPath, deleteEntity = true, truncateEntity = false, truncateEntityAfter = false, authOptions = {} }) {
  return Promise.resolve()
    // Check for required argument properties.
    .then(() => {
      if (typeof app !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: DATAACCESS_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Get "file" and "entityset" name.
    .then(() => {
      // console.log(localPath, fs.existsSync(localPath), fs.lstatSync(localPath).isFile(), path.extname(localPath), path.extname(localPath) === '.json');
      if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile() && path.extname(localPath) === '.json') {
        return {
          entitySet: path.basename(localPath, path.extname(localPath)),
          file: fs.readFileSync(localPath, 'utf8')
        };
      } else {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Delete or truncate or none of the above.
    .then(({ entitySet, file }) => {
      if (typeof deleteEntity === 'boolean' && deleteEntity) {
        return new Promise((resolve, reject) => {
          const { protocol, host, port } = requestOptions;
          const path = `${requestOptions.path}/${app}/${entitySet}/ca.toronto.api.dataaccess.odata4.RemoveAll`;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 204 || response.statusCode === 404) {
                resolve({ entitySet, file });
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.end();
        });
      } else if (typeof truncateEntity === 'boolean' && truncateEntity) {
        return new Promise((resolve, reject) => {
          const payload = JSON.stringify([]);

          const { protocol, host, port } = requestOptions;
          const path = `${requestOptions.path}/${app}/${entitySet}/ca.toronto.api.dataaccess.odata4.Reload`;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 200) {
                resolve({ entitySet, file });
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.write(payload);

          request.end();
        });
      }

      return { entitySet, file };
    })
    .then(({ entitySet, file }) => {
      function truncateAfter() {
        return new Promise((resolve, reject) => {
          const payload = JSON.stringify([]);

          const { protocol, host, port } = requestOptions;
          const path = `${requestOptions.path}/${app}/${entitySet}/ca.toronto.api.dataaccess.odata4.Reload`;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 200) {
                resolve(data);
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.write(payload);

          request.end();
        });
      }

      return new Promise((resolve, reject) => {
        const payload = file;

        const { protocol, host, port } = requestOptions;
        const path = `${requestOptions.path}/${app}/${entitySet}`;
        const method = 'POST';
        const headers = {
          'Accept': 'application/json',
          'Authorization': `AuthSession ${authOptions.data.sid}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        };

        console.log(protocol, host, port, path, method);
        const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
          let chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            let data;
            if (chunks.length > 0) {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            }

            if (response.statusCode === 200 || response.statusCode === 201) {
              if (typeof truncateEntityAfter === 'boolean' && truncateEntityAfter) {
                truncateAfter().then((data) => {
                  resolve(data);
                });
              } else {
                resolve(data);
              }
            } else {
              reject(data);
            }
          });
        });

        request.on('error', (error) => {
          reject(error);
        });

        request.write(payload);
        request.end();
      });
    });
}

function daLocalToRemote({ requestOptions, app, localPath, deleteEntity, truncateEntity, truncateEntityAfter, authOptions = {} }) {
  return Promise.resolve()
    // Check for required argument properties.
    .then(() => {
      if (typeof app !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: DATAACCESS_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Loop local directory and add to remote.
    .then(() => {
      if (fs.existsSync(localPath)) {
        if (fs.lstatSync(localPath).isDirectory()) {
          const allPromises = [];
          let promiseChain = Promise.resolve();

          const dirContents = fs.readdirSync(localPath);
          for (let index = 0, length = dirContents.length; index < length; index++) {
            const dirContentPath = `${localPath}/${dirContents[index]}`;

            if (fs.existsSync(dirContentPath) && fs.lstatSync(dirContentPath).isFile()) {
              promiseChain = promiseChain.then(() => {
                return daLocalFileToRemote({ requestOptions, app, localPath: dirContentPath, deleteEntity, truncateEntity, truncateEntityAfter, authOptions })
                  .catch((error) => {
                    console.error('ERROR', error);
                    return error;
                  });
              });
              allPromises.push(promiseChain);
            }
          }

          return promiseChain.then(() => {
            return Promise.all(allPromises);
          });
        } else if (fs.lstatSync(localPath).isFile()) {
          return daLocalFileToRemote({ requestOptions, app, localPath, deleteEntity, truncateEntity, truncateEntityAfter, authOptions })
            .catch((error) => {
              console.error('ERROR', error);
              return error;
            });
        }
      }
    });
}

function daMediaLocalFileToRemote({ requestOptions, app, entitySet, localPath, authOptions = {} }) {
  return Promise.resolve()
    // Check for required argument properties.
    .then(() => {
      if (typeof app !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof entitySet !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: DATAACCESS_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Get local file and id.
    .then(() => {
      if (fs.existsSync(localPath) && fs.lstatSync(localPath).isFile()) {
        const fileExt = path.extname(localPath);

        return {
          id: path.basename(localPath),
          file: fs.readFileSync(localPath),
          contentType: fileExt in CONTENT_TYPES ? CONTENT_TYPES[fileExt] : 'text/plain'
        };
      } else {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Get method to use.
    .then(({ id, file, contentType }) => {
      return new Promise((resolve, reject) => {
        const { protocol, host, port } = requestOptions;
        const path = `${requestOptions.path}/${app}/${entitySet}('${id}')`;
        const method = 'GET';
        const headers = {
          'Accept': 'application/json',
          'Authorization': `AuthSession ${authOptions.data.sid}`
        };

        console.log(protocol, host, port, path, method);
        const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
          let chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            let data;
            if (chunks.length > 0) {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            }

            if (response.statusCode === 200) {
              resolve({ id, file, contentType, method: 'PUT' });
            } else if (response.statusCode === 404) {
              resolve({ id, file, contentType, method: 'POST' });
            } else {
              reject(data);
            }
          });
        });

        request.on('error', (error) => {
          reject(error);
        });

        request.end();
      });
    })
    // Add or update media.
    .then(({ id, file, contentType, method }) => {
      return new Promise((resolve, reject) => {
        const payload = file;

        // get request options.
        const { protocol, host, port } = requestOptions;
        const path = method === 'POST' ? `${requestOptions.path}/${app}/${entitySet}`
          : `${requestOptions.path}/${app}/${entitySet}('${id}')/$value`;
        const headers = {
          'Accept': 'application/json',
          'Authorization': `AuthSession ${authOptions.data.sid}`,
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(payload),

          'X-DA-MEDIA-ENTITYID': id,
          'X-DA-MEDIA-ENTITYSET': true
        };

        console.log(protocol, host, port, path, method);
        const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
          let chunks = [];

          response.on('data', (chunk) => {
            chunks.push(chunk);
          });

          response.on('end', () => {
            let data
            if (chunks.length > 0) {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            }

            if (response.statusCode === 201 || response.statusCode === 204) {
              resolve(data);
            } else {
              reject(data);
            }
          });
        });

        request.on('error', (error) => {
          reject(error);
        });

        request.write(payload);

        request.end();
      });
    });
}

function daMediaLocalToRemote({ requestOptions, app, entitySet, localPath, deleteEntity = true, truncateEntity = false, authOptions = {} }) {
  return Promise.resolve()
    // Check for required argument properties.
    .then(() => {
      if (typeof app !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof entitySet !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }

      if (typeof localPath !== 'string') {
        throw new Error('ERROR'); // TODO Finalize error message.
      }
    })
    // Finalize "requestOptions" arguments.
    .then(() => {
      if (typeof requestOptions === 'string' && typeof authOptions.requestOptions !== 'string'
        && (typeof authOptions.requestOptions !== 'object' || authOptions.requestOptions === null)) {

        authOptions.requestOptions = requestOptions;
      }

      requestOptions = finalizeRequestOptions({ requestOptions, requestOptionsList: DATAACCESS_REQUEST_OPTIONS_LIST });
    })
    // Authenticate.
    .then(() => {
      return module.exports.auth.authenticate(authOptions);
    })
    // Delete or truncate or none of the above.
    .then(() => {
      if (typeof deleteEntity === 'boolean' && deleteEntity) {
        return new Promise((resolve, reject) => {
          const { protocol, host, port } = requestOptions;
          const path = `${requestOptions.path}/${app}/${entitySet}/ca.toronto.api.dataaccess.odata4.RemoveAll`;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 204 || response.statusCode === 404) {
                resolve(data);
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.end();
        });
      } else if (typeof truncateEntity === 'boolean' && truncateEntity) {
        return new Promise((resolve, reject) => {
          const payload = JSON.stringify([]);

          const { protocol, host, port } = requestOptions;
          const path = `${requestOptions.path}/${app}/${entitySet}/ca.toronto.api.dataaccess.odata4.Reload`;
          const method = 'POST';
          const headers = {
            'Accept': 'application/json',
            'Authorization': `AuthSession ${authOptions.data.sid}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          };

          console.log(protocol, host, port, path, method);
          const request = https.request({ protocol, host, port, path, method, headers }, (response) => {
            let chunks = [];

            response.on('data', (chunk) => {
              chunks.push(chunk);
            });

            response.on('end', () => {
              let data;
              if (chunks.length > 0) {
                data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              }

              if (response.statusCode === 200) {
                resolve(data);
              } else {
                reject(data);
              }
            });
          });

          request.on('error', (error) => {
            reject(error);
          });

          request.write(payload);

          request.end();
        });
      }
    })
    // Loop local directory and add to remote.
    .then(() => {
      if (fs.existsSync(localPath)) {
        const EXCLUDED_FILES = ['.DS_Store'];

        if (fs.lstatSync(localPath).isDirectory()) {
          const allPromises = [];
          let promiseChain = Promise.resolve();

          const dirContents = fs.readdirSync(localPath);
          for (let index = 0, length = dirContents.length; index < length; index++) {
            const dirContentPath = `${localPath}/${dirContents[index]}`;

            if (fs.existsSync(dirContentPath) && fs.lstatSync(dirContentPath).isFile()) {
              promiseChain = promiseChain.then(() => {
                if (EXCLUDED_FILES.indexOf(path.basename(localPath)) === -1) {
                  return daMediaLocalFileToRemote({ requestOptions, app, entitySet, localPath: dirContentPath, authOptions })
                    .catch((error) => {
                      console.error('ERROR', error);
                      return error;
                    });
                }
              });
              allPromises.push(promiseChain);
            }
          }

          return promiseChain.then(() => {
            return Promise.all(allPromises);
          });
        } else if (fs.lstatSync(localPath).isFile()) {
          if (EXCLUDED_FILES.indexOf(path.basename(localPath)) === -1) {
            return daMediaLocalFileToRemote({ requestOptions, app, entitySet, localPath, authOptions })
              .catch((error) => {
                console.error('ERROR', error);
                return error;
              });
          }
        }
      }
    });
}

module.exports.da = {
  localFileToRemote: daLocalFileToRemote,
  localToRemote: daLocalToRemote,
  mediaLocalFileToRemote: daMediaLocalFileToRemote,
  mediaLocalToRemote: daMediaLocalToRemote
}

////////////////////////////////////////////////////////////////////////////////
// GENERIC HELPER
////////////////////////////////////////////////////////////////////////////////

function getCommandLineArguments(flag) {
  if (typeof flag !== 'string') {
    throw new Error('ERROR'); // TODO Finalize error message.
  }

  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return;
  }

  const nextArgument = process.argv[index + 1];
  if (typeof nextArgument === 'string') {
    return nextArgument;
  } else {
    return true;
  }
}

module.exports.helper = {
  cmdArgs: getCommandLineArguments
}
