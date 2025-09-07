const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let backendPort = 0;
async function startBackend() {
    if (backendPort) return backendPort;
    const { startServer } = require('../backend/electron-start');
    backendPort = await startServer();
    return backendPort;
}

let win;
async function createWindow() {
    await startBackend();

    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 640,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;
    if (isDev) {
        const url = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
        await win.loadURL(url);
        win.webContents.openDevTools({ mode: 'detach' });
    } else {
        await win.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
    }

    win.on('ready-to-show', () => win.show());
}

ipcMain.handle('get-base-url', async () => {
    const port = await startBackend();
    return `http://127.0.0.1:${port}`;
});

app.whenReady().then(createWindow);
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
