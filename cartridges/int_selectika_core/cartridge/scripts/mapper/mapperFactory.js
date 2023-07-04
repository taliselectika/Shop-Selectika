var {
    STRATEGY_CONSTANTS
} = require('~/cartridge/scripts/util/selectikaConstants');

const helpers = require('~/cartridge/scripts/helpers/selectikaHelpers');

var emptyFunc = function () {};

var mapFactories = {
    gender: function (params) {
        switch (params.GenderStrategy) {
            case STRATEGY_CONSTANTS.GENDER_STRATEGY_CATEGORY:
                return function (product, parent) {
                    const category = helpers.getParentCategoryByLevel(helpers.getProductCategory(product) || helpers.getProductCategory(parent), params.GenderCategoryDepth);
                    return category ? category.getID() : 'unknown';
                };
            case STRATEGY_CONSTANTS.GENDER_STRATEGY_CUSTOM_FIELD:
                return function (product, parent) {
                    return helpers.getProductCustomField(product, params.GenderField) || helpers.getProductCustomField(parent, params.GenderField) || 'unknown';
                };
            default:
                return emptyFunc;
        }
    },
    productType: function (params) {
        switch (params.ProductTypeStrategy) {
            case STRATEGY_CONSTANTS.PRODUCT_TYPE_STRATEGY_CATEGORY:
                return function (product, parent) {
                    const category = helpers.getParentCategoryByLevel(helpers.getProductCategory(product) || helpers.getProductCategory(parent), params.ProductTypeCategoryDepth);
                    return category ? category.getID() : 'unknown';
                };
            case STRATEGY_CONSTANTS.PRODUCT_TYPE_STRATEGY_CUSTOM_FIELD:
                return function (product, parent) {
                    return helpers.getProductCustomField(product, params.ProductTypeField) || helpers.getProductCustomField(parent, params.ProductTypeField) || 'unknown';
                };
            default:
                return emptyFunc;
        }
    },
    image: function (params) {
        return function (product) {
            var productImage = product.getImage(params.ImageType, 0);
            if (productImage) {
                return productImage.httpsURL.toString();
            }

            return 'NA';
        };
    },
    parentId: function (params) {
        switch (params.ParentProductStrategy) {
            case STRATEGY_CONSTANTS.PARENT_PRODUCT_STRATEGY_ID_SECTION:
                return function (product) {
                    return helpers.getProductIdSection(product, params.ParentProductIdSectionStart, params.ParentProductIdSectionEnd);
                };
            case STRATEGY_CONSTANTS.PARENT_PRODUCT_STRATEGY_MASTER_PRODUCT:
                return function (product) {
                    return 'masterProduct' in product && !empty(product.masterProduct) ? product.masterProduct.getID() : product.getID();
                };
            default:
                return emptyFunc;
        }
    },
    color: function (params) {
        switch (params.ColorStrategy) {
            case STRATEGY_CONSTANTS.COLOR_STRATEGY_ID_SECTION:
                return function (product) {
                    return helpers.getProductIdSection(product, params.ColorIdSectionStart, params.ColorIdSectionEnd);
                };
            case STRATEGY_CONSTANTS.COLOR_STRATEGY_VARIATION_ATTRIBUTE:
                return function (product) {
                    return helpers.getVariationAttributeValue(product, params.ColorVariationAttributeName) || 'NA';
                };
            default:
                return emptyFunc;
        }
    },
    size: function (params) {
        switch (params.SizeStrategy) {
            case STRATEGY_CONSTANTS.SIZE_STRATEGY_ID_SECTION:
                return function (product) {
                    return helpers.getProductIdSection(product, params.SizeIdSectionStart, params.SizeIdSectionEnd);
                };
            case STRATEGY_CONSTANTS.SIZE_STRATEGY_VARIATION_ATTRIBUTE:
                return function (product) {
                    return helpers.getVariationAttributeValue(product, params.SizeVariationAttributeName) || 'NA';
                };
            default:
                return emptyFunc;
        }
    },
    brand: function (params) {
        return function (product) {
            return helpers.getProductCustomField(product, params.BrandField) || product.brand || 'NA';
        };
    }
};

module.exports = mapFactories;
