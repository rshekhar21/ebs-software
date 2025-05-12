// Create custom menu
const template = [
    {
        label: '&File', // Alt+F on Windows/Linux
        submenu: [
            {
                label: 'New File',
                accelerator: 'Ctrl+N',
                click: () => console.log('New File')
            },
            {
                label: 'Open...',
                accelerator: 'Ctrl+O',
                click: () => console.log('Open File')
            },
            { type: 'separator' },
            {
                label: 'Exit',
                role: 'quit'
            }
        ]
    },
    {
        label: '&Edit',
        submenu: [
            { role: 'undo', accelerator: 'Ctrl+Z' },
            { role: 'redo', accelerator: 'Ctrl+Y' },
            { type: 'separator' },
            { role: 'cut', accelerator: 'Ctrl+X' },
            { role: 'copy', accelerator: 'Ctrl+C' },
            { role: 'paste', accelerator: 'Ctrl+V' }
        ]
    },
    {
        label: '&View',
        submenu: [
            { role: 'reload', accelerator: 'Ctrl+R' },
            { role: 'toggleDevTools', accelerator: 'Ctrl+Shift+I' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    {
        label: '&Help',
        submenu: [
            {
                label: 'About',
                click: () => {
                    console.log('About clicked');
                }
            }
        ]
    }
];
module.exports = template;