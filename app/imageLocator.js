const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'raw', 'arw', 'cr2', 'srf', 'sr2', 'tiff'];

const imageLocator = function () {
    return {
        isImage: function (filePath) {
            const extName = path.extname(filePath).toLowerCase().substring(1);
            return _.includes(imageExtensions, extName);
        },
        getItemType: function (itemPath) {
            var ctx = this;
            return new Promise(function (resolve, reject) {
                fs.lstat(itemPath, (err, stats) => {
                    if (err) {
                        return reject(err);
                    } else {
                        if (stats.isFile()) {
                            if (ctx.isImage(itemPath)) {
                                return resolve({
                                    type: "image",
                                    path: itemPath
                                });
                            }
                            return resolve({
                                type: "file",
                                path: itemPath
                            });
                        }
                        if (stats.isDirectory()) {
                            return resolve({
                                type: "directory",
                                path: itemPath
                            });
                        }
                        return resolve({
                            type: "unknown",
                            path: itemPath
                        });
                    }
                });
            });
        },
        getImagePaths: function (dirPath) {
            var ctx = this;
            console.log(`searching in ${dirPath}`);
            return new Promise(function (resolve, reject) {
                let imagePaths = [];
                let typePromises = [];
                let directoryPromises = [];
                fs.readdir(dirPath, function (err, items) {
                    for (var i = 0; i < items.length; i++) {
                        const itemPath = path.join(dirPath, items[i]);
                        console.log(`getting type for ${itemPath}`);
                        typePromises.push(ctx.getItemType(itemPath));
                    }
                    Promise.all(typePromises)
                        .then(values => {
                            console.log('got all types');
                            values.forEach(typeResult => {
                                if (typeResult.type == "image") {
                                    imagePaths.push(typeResult.path);
                                    console.dir(`added image ${typeResult.path}`);
                                }
                                if (typeResult.type == "directory") {
                                    directoryPromises.push(ctx.getImagePaths(typeResult.path));
                                }
                            });
                            Promise.all(directoryPromises)
                                .then(values => {
                                    values.forEach(paths => {
                                        imagePaths.push(...paths);
                                    });
                                    return resolve(imagePaths);
                                })
                                .catch(err => reject(err));
                        })
                        .catch(err => {
                            console.log(err);
                        });
                });
            });
        }
    }
};

module.exports = imageLocator();