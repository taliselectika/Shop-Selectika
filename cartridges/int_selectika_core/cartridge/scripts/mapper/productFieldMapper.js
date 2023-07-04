const objectUtils = require('~/cartridge/scripts/util/objectUtils');

/**
 * Applies mapping functions to a product
 * @param {dw.catalog.Product} product
 * @param {Object} mapFunctions
 * @param {Object} options
 * @param {dw.catalog.Product} options.parent
 * @returns {Array} mapped values
 */
function mapProduct(product, mapFunctions, options) {
    return objectUtils.values(mapFunctions).map(function (mapper) {
        return mapper(product, options);
    });
}

module.exports = {
    mapProduct: mapProduct
};
