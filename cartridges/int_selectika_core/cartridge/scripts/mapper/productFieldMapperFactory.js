var URLUtils = require('dw/web/URLUtils');
var formatMoney = require('dw/util/StringUtils').formatMoney;

var helpers = require('~/cartridge/scripts/helpers/selectikaHelpers');
var objectUtils = require('~/cartridge/scripts/util/objectUtils');
var mapFactories = require('~/cartridge/scripts/mapper/mapperFactory');

/**
 * Generate a set of product mapping methods
 * @param {Object} params
 * @param {string} params.GenderStrategy gender value obtain method
 * @param {number} params.GenderCategoryDepth category depth starting from root for gender category name
 * @param {string} params.GenderField custom field name for gender property
 * @param {string} params.ProductTypeStrategy ProductType value obtain method
 * @param {number} params.ProductTypeCategoryDepth category depth starting from root for the ProductType category name
 * @param {string} params.ProductTypeField custom field name for ProductType property
 * @param {string} params.ImageType image type
 *
 * @returns {Object} an object containing product mapping functions
 */
function getProductFieldMapMethods(params) {
    var mappers = objectUtils.mapObject(mapFactories, function (mapFactory) {
        return mapFactory(params);
    });

    const mapFunctions = {
        productId: function (product) {
            return product.getID();
        },
        parentId: function (product, options) {
            return mappers.parentId(product) || (options.parent && options.parent.ID);
        },
        name: function (product) {
            var productName = product.getName();
            return productName && productName.trim();
        },
        gender: function (product, options) {
            return mappers.gender(product, options.parent);
        },
        productType: function (product, options) {
            return mappers.productType(product, options.parent);
        },
        directUrl: function (product) {
            return URLUtils.https('Product-Show', 'pid', product.getID()).toString();
        },
        image: function (product) {
            return mappers.image(product);
        },
        fullPrice: function (product) {
            return formatMoney(helpers.getProductListPrice(product));
        },
        salesPrice: function (product) {
            const salesPrice = helpers.getProductSalesPrice(product);
            return salesPrice.available ? formatMoney(salesPrice) : '0';

        },
        availability: function (product) {
            return helpers.getProductInStock(product) ? 'in stock' : 'out of stock';
        },
        brand: function (product) {
            return mappers.brand(product);
        },
        color: function (product) {
            return mappers.color(product);
        },
        size: function (product) {
            return mappers.size(product);
        }
    };

    return mapFunctions;
}

module.exports = {
    getProductFieldMapMethods: getProductFieldMapMethods
};
