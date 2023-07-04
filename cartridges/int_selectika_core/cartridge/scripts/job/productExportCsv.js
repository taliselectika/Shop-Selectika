var Logger = require('dw/system/Logger');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');
var ProductMgr = require('dw/catalog/ProductMgr');
var selectikaHelper = require('~/cartridge/scripts/helpers/selectikaHelpers');
var mapperFactory = require('~/cartridge/scripts/mapper/productFieldMapperFactory');
var mapper = require('~/cartridge/scripts/mapper/productFieldMapper');
var settings = require('~/cartridge/scripts/helpers/selectikaSettings');

var mapperFunctions;
var products;

var fileWriter;
var csvWriter;

var mapProduct;

exports.beforeStep = function (parameters) {
    mapperFunctions = mapperFactory.getProductFieldMapMethods(parameters);
    mapProduct = function (product, parentProduct) {
        return mapper.mapProduct(product, mapperFunctions, {parent: parentProduct});
    };

    const targetFolder = parameters.TargetFolder;
    var folder = new File(File.getRootDirectory(File.IMPEX), targetFolder);
    if (!folder.exists() && !folder.mkdirs()) {
        Logger.info('Cannot create IMPEX folders {0}', (File.getRootDirectory(File.IMPEX).fullPath + targetFolder));
        throw new Error('Cannot create IMPEX folders.');
    }

    var csvFile = new File(folder.fullPath + File.SEPARATOR + selectikaHelper.generateFileName());
    fileWriter = new FileWriter(csvFile);
    csvWriter = new CSVStreamWriter(fileWriter);
    var header = selectikaHelper.generateCsvHeader();
    csvWriter.writeNext(header);

    products = ProductMgr.queryAllSiteProducts();
};

exports.getTotalCount = function () {
    Logger.info('Total products: {0}', products.count);
    return products.count;
};

exports.read = function () {
    if (products.hasNext()) {
        return products.next();
    }
};

exports.process = function (product) {
    try {
        if (product.isVariationGroup() && !empty(selectikaHelper.getMasterProduct(product)) && !selectikaHelper.getMasterProduct(product).assignedToSiteCatalog) {
            return product.variants.toArray().map(function (p) {
                return mapProduct(p, product);
            });
        }

        if (!product.isVariant()) {
            return;
        }

        return [mapProduct(product)];
    } catch (e) {
        Logger.error('Failed to process product {0}: {1}', product.getID(), e);
    }
};

exports.write = function (lines) {
    for (var i = 0; i < lines.size(); i++) {
        var line = lines.get(i);
        for (var j = 0; j < line.size(); j++) {
            csvWriter.writeNext(line.get(j).toArray());
        }
    }
};

exports.afterStep = function () {
    products.close();
    fileWriter.close();
};
