'use strict';
var velocity = require('dw/template/Velocity');

var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
var settings = require('*/cartridge/scripts/helpers/selectikaSettings');
var HookMgr = require('dw/system/HookMgr');

function htmlHead() {
    var renderedHtml = renderTemplateHelper.getRenderedHtml({
        merchantId: settings.merchantId()
    }, 'selectika/headerInclude');

    var result = velocity.render(renderedHtml, {
        velocity: velocity
    });
}

exports.htmlHead = htmlHead;