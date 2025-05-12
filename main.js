const log = console.log;
const { app, BrowserWindow, ipcMain, shell, screen, dialog, Menu, powerMonitor } = require('electron/main');
const { exec, spawn } = require('child_process');
const path = require('node:path');
const fs = require('fs-extra');
const os = require('os');
const { autoUpdater } = require('electron-updater');
const lock = app.requestSingleInstanceLock();
if (!lock) { app.quit(); return; }
const elog = require('electron-log');
require('dotenv').config();

const port = process.env.PORT || '3303';
// const template = require('./menu');
elog.transports.file.resolvePathFn = () => path.resolve(app.getPath('userData'), 'logs', 'main.log');


require(path.join(__dirname, 'server'));

let win;
let splashWindow;
let updateAvailable = false;
autoUpdater.autoDownload = false;

function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 750,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        frame: false,
        show: false,
        transparent: true,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: false
        }
    })

    splashWindow.loadFile('splash.html')
    splashWindow.center();
    splashWindow.show();
    splashWindow.on('closed', () => {
        splashWindow = null
    })
}

function createWindow() {
    const appVersion = app.getVersion();
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
    let windowWidth, windowHeight;

    if (screenWidth === 1368) {
        windowWidth = 1360;
        windowHeight = 768;
    } else if (screenWidth >= 1920) {
        windowWidth = 1600;
        windowHeight = 900;
    } else {
        // Default width if neither condition is met. You may need to adjust this.
        windowWidth = 1024; // Or any other default value
    }
    win = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: 1201,
        minHeight: 600,
        autoHideMenuBar: true,
        center: true,
        title: `EBS - ${appVersion}`,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    win.loadURL('http://localhost:' + port);
    win.once('ready-to-show', () => {
        setTimeout(() => {
            splashWindow.destroy(); // Close the splash screen
            win.show()
        }, 1000); // 1000 milliseconds = 1 second
    });
    // const menu = Menu.buildFromTemplate(template);
    // Menu.setApplicationMenu(menu);
    win.focus();
    return win;
}

app.whenReady().then(() => {
    createSplashScreen();
    createWindow();
    autoUpdater.checkForUpdates();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Close the database properly before exiting
app.on('before-quit', () => { });

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// console.log("Electron is using Node.js version:", process.version);

autoUpdater.on('error', (err) => {
    elog.error('Error in auto-updater:', err);
    win.webContents.send('update-error', err.message);
});

// Electron AutoUpdater Events (Fixed `mainWindow` Reference)
autoUpdater.on('update-available', () => {
    elog.info('Update available.');
    updateAvailable = true;
    if (win) win.webContents.send('update-available');
});

ipcMain.on('check-if-update-already-available', (event) => {
    if (updateAvailable) {
        event.sender.send('update-available');
    }
});

autoUpdater.on('download-progress', (progressObj) => {
    elog.info('Update progress.', progressObj.percent);
    win.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
});

ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('open-external-browser', (e, url) => {
    shell.openExternal(url);
});

ipcMain.handle('showPrinters', async (e) => {
    let mainWindow = BrowserWindow.getFocusedWindow();
    let printers = await mainWindow.webContents.getPrintersAsync(); //log(printers.name);
    let printerNames = printers.map(printer => printer.name); //log(printerNames);
    printerNames.push('Cancel');
    let { response } = await dialog.showMessageBox(null, {
        type: 'question',
        buttons: printerNames,
        title: 'Select a printer',
        icon: null,
    });
    let selectedPrinter = printers[response];
    //check for cancel button
    if (response === printerNames.length - 1) { return }
    return selectedPrinter.name;
})

ipcMain.handle('listPrinters', async (e) => {
    try {
        let mainWindow = BrowserWindow.getFocusedWindow();
        let printers = await mainWindow.webContents.getPrintersAsync();
        let printerNames = printers.map(printer => printer.name);
        return printerNames;
    } catch (error) {
        log(error);
        return false;
    }
})

ipcMain.handle('printPage', async (e, printer) => {
    const window = BrowserWindow.getFocusedWindow();
    return new Promise((resolve, reject) => {
        window.webContents.print({
            silent: true,
            deviceName: printer,
        }, (success, errorType) => {
            if (!success) {
                console.error(errorType); //log('false', status)
                reject(false)
            } else {
                resolve(true)
            }
        });
    })
});

ipcMain.handle('printPage1', async (e, printer) => {
    const window = BrowserWindow.getFocusedWindow();
    return new Promise((resolve, reject) => {
        window.webContents.print({
            silent: true,
            deviceName: printer,
            pageSize: { width: 80 * 3.78, height: 297 * 3.78 } // 80mm width, auto height
        }, (success, errorType) => {
            if (!success) {
                console.error(errorType);
                reject(false);
            } else {
                resolve(true);
            }
        });
    });
});

ipcMain.handle('showThermal', async (e, url, printer) => {
    let newWindow = new BrowserWindow({
        width: 400,
        height: 800,
        minWidth: 350,
        minHeight: 400,
        autoHideMenuBar: true,
        // alwaysOnTop: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    newWindow.loadURL(url);
    newWindow.once('ready-to-show', () => {
        newWindow.show() // show the window when it's ready to be displayed
    })
})

ipcMain.handle('showA4', async (e, url, printer) => {
    let newWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true,
        // alwaysOnTop: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    newWindow.loadURL(url);
    newWindow.once('ready-to-show', () => {
        newWindow.show() // show the window when it's ready to be displayed
    })
})

ipcMain.handle('save-pdf', (e, args) => {
    try {
        return new Promise((resolve, reject) => {
            const win = BrowserWindow.getFocusedWindow();
            const dirPath = path.join(os.homedir(), 'Downloads', 'EBS Files'); //log(dirPath);
            if (!fs.existsSync(dirPath)) { fs.mkdirSync(dirPath) }
            const pdfPath = path.join(dirPath, `${args.filename}`);
            let options = {
                pageSize: args.pagesize || 'A4',
                landscape: args.landscape || false
            };
            win.webContents.printToPDF(options).then(data => {
                fs.writeFile(pdfPath, data, (error) => {
                    if (error) return reject(false);
                    // exec(`start "" "${dirPath}"`);
                    return resolve(pdfPath);
                })
            })
        })
    } catch (error) {
        log(error);
    }
})

ipcMain.handle('print-pdf', (e, fileName) => {
    return new Promise(async (resolve, reject) => {
        const win = BrowserWindow.getFocusedWindow();
        const dirPath = path.join(os.homedir(), 'Downloads', 'EBS Files'); //log(dirPath);
        // Create the directory if it doesn't exist
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        const pdfPath = path.join(dirPath, `${fileName}`); //log(pdfPath);
        // let data=await win.webContents.printToPDF({});
        let options = {
            pageSize: 'A4',
            landscape: false
        };
        win.webContents.printToPDF(options).then(data => {
            fs.writeFile(pdfPath, data, (error) => {
                if (error) return reject(false);
                exec(`start "" "${dirPath}"`);
                return resolve(pdfPath);
            })
        })
    })
})

ipcMain.handle('confirmIt', async (e, msg) => {
    const options = {
        type: 'question',
        buttons: ['OK', 'Cancel'],
        defaultId: 0,
        title: 'EBS',
        message: msg,
        icon: null,
    };
    const response = await dialog.showMessageBox(options);
    return response.response === 0; // Returns true if 'OK' was clicked, false if 'Cancel' was clicked
})