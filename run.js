const {exec} = require('child_process');

/**
 * @param {string} command
 * @param {(stdout: string) => any} callback
 */
module.exports = async (command, callback) =>
  new Promise((res, rej) => {
    exec(
      command,
      (err, stdout, stderr) => {
        if (err) {
          rej(err);
        }

        if (stderr) {
          rej(stderr);
        }

        res(callback(stdout))
    });
})
