var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
	var envConfig = require('./config.json')[env];

	Object.keys(envConfig).forEach((key) => {
		process.env[key] = envConfig[key];
	});
}
