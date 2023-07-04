'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/**
 * Returns a newly initialized service with the given {serviceID}.
 * This method should only be used to initialize (S)FTP services
 *
 * @param {String} serviceId The service ID to initialize
 * @throw {Error} If the service does not exists in the Business Manager
 * @returns {Object} the initialized FTP service
 */

module.exports.getService = function (serviceId) {
    return LocalServiceRegistry.createService(serviceId, {
        createRequest: function (service) {
            var args = Array.prototype.slice.call(arguments, 1);
            service.setOperation.apply(service, args);
            return service;
        },
        parseResponse: function (service, result) {
            return result;
        }
    });
};
