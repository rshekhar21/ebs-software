const { contextBridge, ipcRenderer } = require('electron')
const log = console.log; //log('ok');

const api = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    openLink: (url) => ipcRenderer.send('open-external-browser', url),
    sendEmail: (data) => ipcRenderer.invoke('sendEmail', data),
    printPage: (printer) => ipcRenderer.invoke('printPage', printer),
    printAndClose: (printer) => ipcRenderer.invoke('printAndClose', printer),
    printA4: (printer) => ipcRenderer.invoke('printA4', printer),
    printA5: (printer) => ipcRenderer.invoke('printA5', printer),
    printWithOptions: (args) => ipcRenderer.invoke('print-with-options', args),
    showPrinters: () => ipcRenderer.invoke('showPrinters'),
    listPrinters: () => ipcRenderer.invoke('listPrinters'),
    printOrder: (obj) => ipcRenderer.invoke('printOrder', obj),
    showThermal: (url) => ipcRenderer.invoke('showThermal', url),
    showA4: (url) => ipcRenderer.invoke('showA4', url),
    newPage: (url) => ipcRenderer.invoke('new-window', url),
    confirmIt: (msg) => ipcRenderer.invoke('confirmIt', msg),
    printPdf: (fileName) => ipcRenderer.invoke('print-pdf', fileName),
    savepdf: (args) => ipcRenderer.invoke('save-pdf', args),
    openFile: (fileName) => ipcRenderer.invoke('open-file', fileName),
    openDoc: (fileName) => ipcRenderer.invoke('open-doc', fileName),
    print2pdfLs: (fileName) => ipcRenderer.invoke('print2pdfLs', fileName),
    saveImage: (obj) => ipcRenderer.invoke('save-image', obj),
    removeImage: (img) => ipcRenderer.invoke('remove-image', img),
    openFolder: () => ipcRenderer.invoke('open-folder'),
    msgBox: (msg) => ipcRenderer.invoke('msgBox', msg),
    outlook: (args) => ipcRenderer.invoke('outlook', args),
    newWindow: (args) => ipcRenderer.invoke('newWindow', args),
    captureImg: () => ipcRenderer.invoke('capture-image'),
    calc: () => ipcRenderer.invoke('calc'),
    uploadCnstr: () => ipcRenderer.invoke('upload-cnstr'),
    getFilePath: () => ipcRenderer.invoke('get-filepath'),
    saveHtml: () => ipcRenderer.invoke('save-html'),
    changePort: (port) => ipcRenderer.invoke('change-port', port),
    restartApp: (msg) => ipcRenderer.invoke('restart-app', msg),
    restart: () => ipcRenderer.invoke('restart'),
    hostIPAddress: () => ipcRenderer.invoke('host-ip'),
    systemIdelTime: () => ipcRenderer.invoke('system-idel-time'),
    delTemp: () => ipcRenderer.invoke('del-temp'),
    tempData: () => ipcRenderer.invoke('temp-data'),
    start: () => ipcRenderer.invoke('start-server'),
    setApp: (obj) => ipcRenderer.invoke('setup-app', obj),
    setupnew: (obj) => ipcRenderer.invoke('setup-new', obj),
    switchApp: () => ipcRenderer.invoke('stop-server'),
    stop: () => ipcRenderer.invoke('stop-server'),
    loadProfile: (data) => ipcRenderer.invoke('load-profile', data),
    ebsstore: (operation, ...args) => ipcRenderer.invoke('ebs-store', operation, ...args),
    quit: () => ipcRenderer.invoke('quit-app'),
    checkIfUpdateAvailable: () => ipcRenderer.send('check-if-update-already-available'),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, percent) => callback(percent)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    requestDownload: () => ipcRenderer.send('download-update'),
    requestInstall: () => ipcRenderer.send('install-update'),
    mystore: async (operation, ...args) => {
        try {
            return await ipcRenderer.invoke('ebs-store', operation, ...args);
        } catch (error) {
            // Handle IPC errors
            console.error(error);
        }
    },
}

contextBridge.exposeInMainWorld('app', api)