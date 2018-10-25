const path = require('path');
const ExifImage = require('exif').ExifImage;
const moment = require('moment');

const imageDates = function () {
    return {
        getFileCreateDate: function (filePath) {
            return new Promise(function (resolve, reject) {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.log(`[fs.stat][err] - ${err}`);
                        return reject(err);
                    } else {
                        const parsedDate = moment(stats.birthtime);
                        return resolve(parsedDate);
                    }
                });
            });
        },
        getExifData: async function (filePath) {
            return new Promise(function (resolve, reject) {
                try {
                    new ExifImage({ image: filePath }, (err, exifData) => {
                        if (err) {
                            console.log(`[ExifImage][err] - [${filePath}][${err}]`);
                            return reject(err);
                        }

                        return resolve(exifData);
                    });
                } catch (err) {
                    console.log(`[ExifImage][err] - [${filePath}][${err}]`);
                    return reject(err);
                }
            });
        },
        getImageDate: async function (filePath) {
            var ctx = this;
            return new Promise(async function (resolve, reject) {
                try {
                    const extName = path.extname(filePath).toLowerCase().substring(1);
                    if (extName === 'jpg' || extName === 'jpeg') {
                        let exifData = await ctx.getExifData(filePath);
                        if (exifData.exif && exifData.exif.CreateDate) {
                            const parsedDate = moment(exifData.exif.CreateDate, 'YYYY:MM:DD HH:mm:ss');
                            return resolve(parsedDate);
                        }
                    }
                    let createDate = await ctx.getFileCreateDate(filePath);
                    console.log(`file create date: ${createDate}`);
                    return resolve(createDate);
                } catch (err) {
                    console.log(`[imageDates][getImageDate] - ${filePath}`, err);
                    reject(err);
                }
            });
        }
    };
};

module.exports = imageDates();