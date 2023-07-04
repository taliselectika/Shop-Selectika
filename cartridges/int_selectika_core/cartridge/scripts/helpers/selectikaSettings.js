var Site = require('dw/system/Site');

var settings = {
    merchantId: function () {
        return Site.getCurrent().getCustomPreferenceValue('selectika_MerchantId');
    }
};

module.exports = settings;
