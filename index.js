#!/usr/bin/env node

// Комманды:
// kubectl get pods -n=<namespace>
// kubectl exec -it <pod-name> -n=<namespace> -- sh
// pm2 log

require('dotenv').config()
const {spawn} = require('child_process');
const run = require('./run');

const NAMESPACE = process.env.NAMESPACE

const s = process.argv
  .slice(2)
  .find(e => e.startsWith('-s='))
  ?.slice(3);

const [folderName] = process.cwd()
  .split('/')
  .slice(-1);

/** @type {string} */
let serviceName;

if (s) {
  serviceName = s;
} else {
  serviceName = folderName;
}

serviceName = serviceName.split('.service')[0].replace('.', '-');

(async () => {

  try {

    const podName = await run(`kubectl get pods -n=${NAMESPACE}`, (stdout) => {
      return stdout
        .split('\n')
        .find(str => {
          if (!serviceName.includes('business')) {
            return str.startsWith(serviceName) && !str.includes('business')
          }
          return str.includes(serviceName)
        })
        ?.split(' ')[0];
    });

    if (!podName) {
      console.log(`Service ${serviceName} not found`)
      process.exit(0);
    }

    spawn(
      'kubectl',
      [
        'exec',
        '-it',
        podName,
        `-n=${NAMESPACE}`,
        '--',
        'pm2',
        'log'
      ],
      {
        stdio: 'inherit'
      }
    );

  } catch (err) {
    console.error(`Error in script \n${err}`);
    process.exit(1)
  }

})();
