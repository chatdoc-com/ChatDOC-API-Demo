const runAll = require('npm-run-all');

runAll(['client:dev', 'server:dev'], {
  parallel: true,
  stdout: process.stdout,
  stderr: process.stderr,
})
  .then(() => {
    console.info('>>> success running scripts client:dev and server:dev');
  })
  .catch((err) => {
    console.error('>>> error running scripts client:dev and server:dev');
    console.dir(err);
    console.log(err.code, err.results[1].code);
    process.exitCode = err.code;
  });
