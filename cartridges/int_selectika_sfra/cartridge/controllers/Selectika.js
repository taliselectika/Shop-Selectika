'use strict';
var cache = require('*/cartridge/scripts/middleware/cache');

var server = require('server');

server.use('Recommendations', server.middleware.include, cache.applyDefaultCache, function (req, res, next) {
    var settings = require('*/cartridge/scripts/helpers/selectikaSettings');
    
    var merchantId = settings.merchantId();
    var productId = req.querystring.productID;
    var lang = req.locale.id.substring(0, 2);

    res.render('selectika/recommendationsInclude', {
        merchantId: merchantId,
        productId: productId,
        lang: lang
    })
    next();
});

module.exports = server.exports();