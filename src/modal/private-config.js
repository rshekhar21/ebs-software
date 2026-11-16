const fs = require('fs-extra');
const os = require('os');
const path = require('path');

function getPrivateConfigPath() {
    if (process.env.EBS_PRIVATE_CONFIG_PATH) {
        return path.resolve(process.env.EBS_PRIVATE_CONFIG_PATH);
    }

    const electron = require('electron');
    const app = typeof electron === 'object' && electron !== null ? electron.app : null;
    const userDataPath = app?.getPath
        ? app.getPath('userData')
        : path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'myebs-app');

    return path.join(userDataPath, 'myebs', 'private-config.json');
}

function createConfigTemplate(configPath) {
    fs.ensureDirSync(path.dirname(configPath));
    fs.writeJsonSync(configPath, {
        database: {
            host: 'db.myebs.in',
            port: 3306,
            user: 'master',
            password: '',
            database: 'ebs_clients'
        },
        aws: {
            accessKeyId: '',
            secretAccessKey: ''
        },
        recaptchaSecret: ''
    }, { spaces: 2 });
}

function readPrivateConfig() {
    const configPath = getPrivateConfigPath();

    if (!fs.existsSync(configPath)) {
        createConfigTemplate(configPath);
        throw new Error(`A private configuration template was created at ${configPath}. Fill in its credentials and restart the app.`);
    }

    const config = fs.readJsonSync(configPath);
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
        throw new Error(`Invalid private configuration file: ${configPath}`);
    }

    return config;
}

module.exports = { getPrivateConfigPath, readPrivateConfig };
