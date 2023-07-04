var Calendar = require('dw/util/Calendar');
var Locale = require('dw/util/Locale');
var Money = require('dw/value/Money');
var StringUtils = require('dw/util/StringUtils');

var constants = require('~/cartridge/scripts/util/selectikaConstants');
var settings = require('~/cartridge/scripts/helpers/selectikaSettings');

/**
 * Generates a CSV header
 * @returns {Array<string>} array of headers
 */
function generateCsvHeader() {
    var values = Object.keys(constants.HEADER_VALUES).map(function (v) {
        return constants.HEADER_VALUES[v];
    });

    return values;
}

/**
 * Gets master product
 * @param {dw.catalog.Product | dw.catalog.VariationGroup | dw.catalog.Variant} product
 * @returns master product
 */
function getMasterProduct(product) {
    return 'masterProduct' in product ? product.masterProduct : null;
}

/**
 * Gets parent category for a given category, relative to the root category
 * @param {dw.catalog.Category | null} [category]
 * @param {number} level category depth
 * @returns {dw.catalog.Category | null} parent category or null if there's no category available
 */
function getParentCategoryByLevel(category, level) {
    if (empty(category)) {
        return null;
    }

    let parent = category.getParent();
    for (let i = 0; i < level; i++) {
        if (!parent) {
            break;
        }
        parent = parent.getParent();
    }
    let result = category;

    while (parent !== null && result !== null) {
        result = result.getParent();
        parent = parent.getParent();
    }

    return result;
}

/**
 * Gets a product category
 * @param {dw.catalog.Product | dw.catalog.Variant | dw.catalog.VariationGroup | null} product a product
 * @returns {dw.catalog.Category | null} product category or null if no category assigned
 */
function getProductCategory(product) {
    if (empty(product)) {
        return null;
    }

    var category = product.getPrimaryCategory();
    if (!empty(category)) {
        return category;
    }

    var categories = product.getCategories();
    if (categories && categories.length) {
        return categories[0];
    }

    var masterProduct = getMasterProduct(product);

    if (masterProduct) {
        return getProductCategory(masterProduct);
    }

    return null;
}

/**
 * Gets a minimum available price for a tiered price
 * @param {dw.catalog.ProductPriceTable} priceTable product price table
 * @returns {dw.value.Money} price
 */
function getTieredMinPrice(priceTable) {
    var startingFromPrice = null;
    var quantities = priceTable.getQuantities();
    var quantitiesIterator = quantities.iterator();
    while (quantitiesIterator.hasNext()) {
        var quantity = quantitiesIterator.next();
        var price = priceTable.getPrice(quantity);

        if (!startingFromPrice || price.getDecimalValue().get() < startingFromPrice.getDecimalValue().get()) {
            startingFromPrice = price;
        }
    }

    return startingFromPrice;
}

/**
 * Gets product list price
 * @param {dw.catalog.Product} product
 * @returns {dw.value.Money} product list price
 */
function getProductListPrice(product) {
    var priceModel = product.getPriceModel();
    var priceTable = priceModel.getPriceTable();
    // TIERED
    if (priceTable.quantities.length > 1) {
        return getTieredMinPrice(priceTable);
    }

    // RANGE
    if ((product.master || product.variationGroup) && priceModel.priceRange) {
        return priceModel.minPrice;
    }

    if ((product.master || product.variationGroup) && product.variationModel.variants.length > 0) {
        product = product.variationModel.variants[0];
        priceModel = product.priceModel;
    }

    return getListPrice(priceModel);
}

/**
 * Gets product sales price
 * @param {dw.catalog.Product} product
 * @returns {dw.value.Money} product sales price
 */
function getProductSalesPrice(product) {
    var priceModel = product.getPriceModel();
    var promotionPrice = getPromotionPrice(product);
    var salesPrice = priceModel.price;
    if (promotionPrice && promotionPrice.available && salesPrice.compareTo(promotionPrice)) {
        salesPrice = promotionPrice;
    }

    var listPrice = getProductListPrice(product);
    if (salesPrice && listPrice && salesPrice.value === listPrice.value) {
        return Money.NOT_AVAILABLE;
    }

    if (salesPrice.valueOrNull === null && (listPrice && listPrice.valueOrNull !== null)) {

        return Money.NOT_AVAILABLE;
    }

    return salesPrice;
}

/**
 * Gets promotional price for a product
 * @param {dw.catalog.Product} product
 * @returns {dw.value.Money} promo price
 */
function getPromotionPrice(product) {
    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var promotions = PromotionMgr.getActivePromotions().getProductPromotions(product).iterator();
    var PROMOTION_CLASS_PRODUCT = require('dw/campaign/Promotion').PROMOTION_CLASS_PRODUCT;
    let promotion;
    while (promotions.hasNext()) {
        var promo = promotions.next();
        if (promo.promotionClass && promo.promotionClass.equals(PROMOTION_CLASS_PRODUCT)) {
            promotion = promo;
            break;
        }
    }

    if (promotion) {
        return promotion.getPromotionalPrice(product, product.optionModel);
    }

    return Money.NOT_AVAILABLE;
}

/**
 * Gets root pricebook for a given pricebook
 * @param {dw.catalog.PriceBook} priceBook a price book
 * @returns {dw.catalog.PriceBook} root pricebook
 */
function getRootPriceBook(priceBook) {
    var rootPriceBook = priceBook;
    while (rootPriceBook.parentPriceBook) {
        rootPriceBook = rootPriceBook.parentPriceBook;
    }
    return rootPriceBook;
}

/**
 * Gets a list price from a price model
 * @param {dw.catalog.ProductPriceModel} priceModel a price model
 * @returns {dw.value.Money} list price for a price model
 */
function getListPrice(priceModel) {
    var price = Money.NOT_AVAILABLE;
    var priceBook;
    var priceBookPrice;

    if (priceModel.price.valueOrNull === null && priceModel.minPrice) {
        return priceModel.minPrice;
    }

    priceBook = getRootPriceBook(priceModel.priceInfo.priceBook);
    priceBookPrice = priceModel.getPriceBookPrice(priceBook.ID);

    if (priceBookPrice.available) {
        return priceBookPrice;
    }

    price = priceModel.price.available ? priceModel.price : priceModel.minPrice;

    return price;
}

/**
 * Gets custom field value from a product
 * @param {dw.catalog.Product} product a product
 * @param {string} fieldName custom field name
 * @returns {*} custom field value
 */
function getCustomField(product, fieldName) {
    return product && product.custom && fieldName in product.custom && product.custom[fieldName];
}

/**
 * Gets product variation attribute value
 * @param {dw.catalog.Product} product
 * @param {string} attrName
 * @returns variation attribute display value
 */
function getVariationAttributeValue(product, attrName) {
    const variationModel = product.getVariationModel();
    const variationAttributes = variationModel.productVariationAttributes && variationModel.productVariationAttributes.iterator();
    if (!variationAttributes) {
        return null;
    }

    while (variationAttributes.hasNext()) {
        var attr = variationAttributes.next();
        if (attr.ID === attrName) {
            const value = variationModel.getVariationValue(product, attr);
            return value && value.displayValue;
        }
    }

    return null;
}

/**
 * Generates export File Name
 * @returns {string} file name
 */
function generateFileName() {
    var name = settings.merchantId();
    var timestamp = getTimeStamp();

    return name + '_' + timestamp + '.csv';
}

/**
 * Generates time stamp
 * @returns {string} formatted timestamp
 */
function getTimeStamp() {
    var calendar = new Calendar();
    var timestamp = StringUtils.formatCalendar(calendar, 'ddMMyy_HHmmss');

    return timestamp;
}

/**
 * Gets a section of product id
 * @param {dw.catalog.Product} product a product
 * @param {number} start section start
 * @param {number} end section end
 * @returns {string}
 */
function getProductIdSection(product, start, end) {
    var productId = product.getID();

    if (empty(productId)) {
        return '';
    }

    if (empty(end) || productId.length <= end) {
        end = undefined;
    }

    return productId.substring(start, end);
}

/**
 * Checks product stock
 * @param {dw.catalog.Product} product a product
 * @returns {boolean} whether product is in stock
 */
function getProductInStock(product) {
    var availabilityModel = product.getAvailabilityModel();
    return availabilityModel && availabilityModel.isOrderable();
}

/**
 * Get locale language code
 * @param {string} localeId
 * @returns {string} language code
 */
function getLocaleLanguage(localeId) {
    var locale = Locale.getLocale(localeId);

    if (locale) {
        return locale.language;
    }

    return localeId.substring(0, 2);
}

module.exports = {
    generateFileName: generateFileName,
    generateCsvHeader: generateCsvHeader,
    getParentCategoryByLevel: getParentCategoryByLevel,
    getProductCategory: getProductCategory,
    getProductListPrice: getProductListPrice,
    getProductSalesPrice: getProductSalesPrice,
    getProductCustomField: getCustomField,
    getVariationAttributeValue: getVariationAttributeValue,
    getProductIdSection: getProductIdSection,
    getProductInStock: getProductInStock,
    getLocaleLanguage: getLocaleLanguage,
    getMasterProduct: getMasterProduct
};
