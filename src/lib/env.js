import fs from 'fs';
import path from 'path';


export const loadEnv = () => {
  const projectDir = process.cwd();
  const wranglerJsonPath = path.join(projectDir, 'wrangler.jsonc');

  if (fs.existsSync(wranglerJsonPath)) {
    const wranglerConfig = JSON.parse(fs.readFileSync(wranglerJsonPath, 'utf-8'));
    const envConfig = wranglerConfig.vars || {};

    Object.keys(envConfig).forEach(key => {
      process.env[key] = envConfig[key];
    });
  } else {
    console.warn('The file wrangler.json was not found.');
  };
};