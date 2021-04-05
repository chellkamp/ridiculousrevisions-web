const fs = require('fs');
const path = require('path');
const {runServer} = require('./server');

process.env['NODE_ENV'] = 'development';
process.env['PORT'] = 3000;

if (process.argv.length < 3) {
	console.log("Missing config path argument.");
	process.exit(1);
}

if (fs.existsSync(process.argv[2]) && fs.lstatSync(process.argv[2]).isFile()) {
	fs.copyFileSync(process.argv[2], path.join(process.mainModule.path, "private.config"));
} else {
	console.log("Config path is not an existing file.");
	process.exit(1);
}

runServer();
