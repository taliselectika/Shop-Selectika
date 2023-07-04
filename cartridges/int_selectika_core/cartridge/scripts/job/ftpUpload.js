

var File = require('dw/io/File');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

var selectikaFtpService = require('~/cartridge/scripts/init/selectikaFtpService');
var fileHelpers = require('~/cartridge/scripts/helpers/fileHelpers');

/**
 *   Copies files to a remote (S)FTP-Location
 *   @param FilePattern: String Input File pattern (default is (*.csv))
 *   @param TargetFolder: String Remote folder of FTP Server.
 *   @param SourceFolder: String Local folder relatively to IMPEX/.
 *   @param ArchiveFolder: String Archive folder path.
 *   @param ServiceID: String The service ID used to connect to the ftp server.
*/

function getFolder(folderName) {
    return File.IMPEX + (folderName.charAt(0).equals(File.SEPARATOR) ? folderName + File.SEPARATOR : File.SEPARATOR + folderName);
}

/**
 * Uploads files from IMPEX to SFTP/FTP
 * @returns {dw.system.Status} OK || ERROR
 */
var upload = function upload() {
    var args = arguments[0];

    // Load input Parameters
    var serviceID = args.ServiceID;
    var filePattern = args.FilePattern;
    var sourceFolder = args.SourceFolder;
    var targetFolder = args.TargetFolder;
    var archiveFolder = args.ArchiveFolder;

    // Test mandatory parameters
    if (!serviceID || !sourceFolder || !targetFolder) {
        return new Status(Status.ERROR, 'ERROR', 'Parameters are missing.');
    }

    var sourceDirectory = getFolder(sourceFolder);
    var fileList = fileHelpers.getFilesInFolder(sourceDirectory, filePattern);
    if (fileList.length === 0) {
        return new Status(Status.ERROR, 'ERROR', 'No files to upload.');
    }

    archiveFolder = getFolder(archiveFolder);
    var archiveFolderFile = new File(archiveFolder);
    if (!archiveFolderFile || (!archiveFolderFile.isDirectory() && !archiveFolderFile.mkdirs())) {
        throw new Error('Can not create IMPEX Archive folder: ' + archiveFolder);
    }

    targetFolder = targetFolder.charAt(targetFolder.length - 1).equals(File.SEPARATOR) ? targetFolder : targetFolder + File.SEPARATOR;
    var ftpService = selectikaFtpService.getService(serviceID);

    var targetFolderStr = targetFolder.charAt(0) === File.SEPARATOR ? targetFolder.substring(1) : targetFolder;
    var isRemoteDirExist = ftpService.call('cd', targetFolderStr);
    // Creating FTP Folder Directory if doesn't exist
    if (!isRemoteDirExist.ok) {
        Logger.info('The folder {0} does not exist. Creating the folder.', targetFolderStr);
        var directoriesArray = targetFolderStr.substring(0, targetFolderStr.length - 1).split(File.SEPARATOR);
        var dirPath = '';
        directoriesArray.forEach(function (dir, index) {
            if (index === 0) {
                dirPath = dir + File.SEPARATOR;
            } else {
                dirPath = dirPath + dir + File.SEPARATOR;
            }

            if (!ftpService.call('cd', dirPath).ok) {
                ftpService.call('mkdir', dirPath);
            }
        });
        if (!ftpService.call('cd', targetFolderStr).ok) {
            throw new Error('Not able to change to target folder.');
        }
    }

    fileList.forEach(function (filePath) {
        var file = new File(filePath);
        var remoteFilePath = targetFolder + file.getName();
        Logger.info('Uploading {0} to {1}.', file, remoteFilePath);

        var serviceResult = ftpService.call('putBinary', remoteFilePath, file);
        var isUploadSuccessful = serviceResult.getObject();
        if (!serviceResult.isOk() || !isUploadSuccessful) {
            throw new Error('SFTP Service: couldn\'t upload file: ' + file.getFullPath() + ' error: ' + serviceResult.getErrorMessage());
        }
        Logger.info('File {0} successfully uploaded.', remoteFilePath);

        if (archiveFolderFile) {
            var theArchiveFile = new File(archiveFolderFile.fullPath + File.SEPARATOR + file.getName());
            file.renameTo(theArchiveFile);
        }
    });

    return new Status(Status.OK, 'OK', 'Upload successful.');
};

exports.Upload = upload;
