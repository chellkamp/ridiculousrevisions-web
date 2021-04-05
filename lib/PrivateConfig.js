const fs = require('fs');
const path = require('path');

const globalKey = Symbol.for(`${module.id}:privateconfig`);

/**
 * Singleton config class.  Call static load() in the beginning to populate it with a file.
 * Afterwards, call static get() to retrieve the instance.
 */
export class PrivateConfig {
	
	/**
	 * Get the config instance. Loads the config file if not already loaded.
	 */
	static get() {
		if (!global[globalKey]) {
			let configPath = path.join(process.mainModule.path, 'private.config');
			let configContents = fs.readFileSync(configPath).toString('utf8');
			global[globalKey] = JSON.parse(configContents);
			
			if (global[globalKey]['file_contents']) {
				let fileContentCollObj = global[globalKey].file_contents;
				let fileKeys = Object.keys(fileContentCollObj);
				fileKeys.forEach(
					key => {
						if (fileContentCollObj[key]) {
							let filePath = path.join(process.mainModule.path, fileContentCollObj[key]);
							fileContentCollObj[key] = fs.readFileSync(filePath);
						}
					}
				);
			}
			
			Object.freeze(global[globalKey]);
		}
		return global[globalKey];
	}
}
