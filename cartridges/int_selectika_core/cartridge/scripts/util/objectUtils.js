function values(object) {
    var valuesArray = [];
    var keys = Object.keys(object);
    for (let index = 0; index < keys.length; index++) {
        valuesArray.push(object[keys[index]]);
    }

    return valuesArray;
}

function mapObject(object, mapFunc) {
    return Object.keys(object).reduce(function(result, key) {
        result[key] = mapFunc(object[key]);
        return result; 
    }, {});
}
module.exports = {
    values: values,
    mapObject: mapObject
}