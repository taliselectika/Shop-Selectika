const HEADER_VALUES = {
    'ID': 'id number',
    'PARENT_ID': 'Parent Item',
    'ITEM_NAME': 'item name',
    'GENDER': 'gender',
    'PRODUCT_TYPE': 'product type',
    'DIRECT_URL': 'Direct url',
    'IMAGE_1': 'image 1',
    'FULL_PRICE': 'full price',
    'SALE_PRICE': 'salePrice',
    'AVAILABILITY': 'availability',
    'BRAND': 'brand',
    'COLOR': 'color',
    'SIZE': 'size'
};

const STRATEGY_CONSTANTS = {
    GENDER_STRATEGY_CATEGORY: 'Category',
    GENDER_STRATEGY_CUSTOM_FIELD: 'Custom Field',
    PRODUCT_TYPE_STRATEGY_CATEGORY: 'Category',
    PRODUCT_TYPE_STRATEGY_CUSTOM_FIELD: 'Custom Field',
    PARENT_PRODUCT_STRATEGY_ID_SECTION: 'ID Section',
    PARENT_PRODUCT_STRATEGY_MASTER_PRODUCT: 'Master Product',
    COLOR_STRATEGY_ID_SECTION: 'ID Section',
    COLOR_STRATEGY_VARIATION_ATTRIBUTE: 'Variation Attribute Value',
    SIZE_STRATEGY_ID_SECTION: 'ID Section',
    SIZE_STRATEGY_VARIATION_ATTRIBUTE: 'Variation Attribute Value'
};

module.exports = {
    HEADER_VALUES: HEADER_VALUES,
    STRATEGY_CONSTANTS: STRATEGY_CONSTANTS
};
