const Emitter = require("events").EventEmitter;
const util = require("util");
const {dialog} = require('electron').remote;
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const ExifImage = require('exif').ExifImage;
const moment = require('moment');

const imageLocator = require('./imageLocator');
const imageDates = require('./imageDates');

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'raw', 'arw', 'cr2', 'srf', 'sr2', 'tiff'];

const App = function() {
    const state = {
        sourcePath: '',
        targetPath: '',
        totalImages: 0,
        imagesProcessed: 0
    };

    const openFolder = function(callback) {
        dialog.showOpenDialog({
            title: "Select a folder",
            properties: ["openDirectory"]
        }, (folderPaths) => {
            if (folderPaths && folderPaths.length > 0) {
                const folder = folderPaths[0];
                console.log(`[openFolder] - ${folder}`);
                callback(folder);
            }
        });
    };

    const setSourcePath = function(newPath) {
        state.sourcePath = newPath;
        if (state.targetPath !== '') {
            this.emit('sort-enabled', true);
        }
    };

    const setTargetPath = function(newPath) {
        state.targetPath = newPath;
        if (state.sourcePath !== '') {
            this.emit('sort-enabled', true);
        }
    };

    const createDestinationPath = function(imageDate, imagePath) {
        const imageName = path.basename(imagePath);
        return path.join(
            state.targetPath,
            imageDate.format('YYYY'),
            imageDate.format('MM'),
            imageDate.format('DD'),
            imageName);
    };

    const copyImageToTargetOrganizedByDate = async (imagePath) => {
        let imageDate = await imageDates.getImageDate(imagePath);
        let destinationPath = createDestinationPath(imageDate, imagePath);
        if (!fs.existsSync(destinationPath)) {
            console.log(`copying ${imagePath} to ${destinationPath}`);
            try {
                let result = await fs.copy(imagePath, destinationPath);
                console.log(`copy completed result: ${result}`);
                this.emit('image-action', `copied - ${destinationPath}`);
            } catch (err) {
                console.log(`[copyImageToTargetOrganizedByDate][error] - ${err}`);
                this.emit('sort-error', `Error copying ${imagePath} to ${destinationPath}`);
            }
        }
    };

    const sortImages = async function() {
        if (state.sourcePath === state.targetPath) {
            this.emit('sort-error', 'Source and Target cannot be the same');
            return;
        }

        this.emit('sort-enabled', false);

        let imagePaths = await imageLocator.getImagePaths(state.sourcePath);

        this.emit('image-count', imagePaths.length);

        for(let i = 0;i < imagePaths.length; i++) {
            await copyImageToTargetOrganizedByDate(imagePaths[i]);
            state.imagesProcessed++;
            this.emit('copy-count', state.imagesProcessed);
            this.emit('percent-complete', state.imagesProcessed / state.totalImages);
        }

        console.log('copy complete');
        this.emit('copy-complete', true);
    };

    this.on('open-folder', openFolder);
    this.on('set-source', setSourcePath);
    this.on('set-target', setTargetPath);
    this.on('sort-images', sortImages);
};

util.inherits(App, Emitter);
module.exports = new App();