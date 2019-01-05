'use strict';
 
const {app, BrowserWindow} = require('electron');
const locals = {};
const pug = require('electron-pug')({pretty: true}, locals);

require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({ width: 1024, height: 768, minWidth: 800, minHeight: 600 });
    //mainWindow.webContents.openDevTools();

    let mainWindowPath = `file://${__dirname}\\views\\index.pug`;

    console.log('loading main window', mainWindowPath);
 
    mainWindow.loadURL(mainWindowPath);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});