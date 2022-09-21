const {app, electron, BrowserWindow} = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        resizable: false,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false,
        }
    })

    win.loadFile("index.html")
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length ===0){
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});