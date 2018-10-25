'use strict';
 
const {app, BrowserWindow} = require('electron');
const locals = {};
const pug = require('electron-pug')({pretty: true}, locals);

require('electron-reload')(__dirname);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({ width: 800, height: 600, minWidth: 800, minHeight: 600 });
    //mainWindow.webContents.openDevTools();
 
    mainWindow.loadURL(`file://${__dirname}/views/index.pug`);

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