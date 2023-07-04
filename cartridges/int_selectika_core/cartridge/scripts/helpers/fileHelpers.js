var File = require('dw/io/File');

/**
 * Loads files from a given directory that match the given pattern
 *
 * @param {string} folder Directory path to load from
 * @param {string} fileNamePattern RegEx pattern that the filenames must match
 *
 * @returns {Array} files present at source folder
 */
function getFilesInFolder(folder, fileNamePattern) {
    var dir = new File(folder);

    if (!dir.isDirectory()) {
        throw new Error('Folder is not available');
    }

    var files = dir.list();

    return files.filter(function (path) {
        return !fileNamePattern || (fileNamePattern && path.match(fileNamePattern) !== null);
    }).map(function (path) {
        return folder + File.SEPARATOR + path;
    });
}

module.exports = {
    getFilesInFolder: getFilesInFolder
};
