const res = require('express/lib/response');
const {ExpressError} = require('../expressError')

function filterValidate(filters){
    const keys = Object.keys(filters)
    
    //Check which filters exist
    let minFilter, maxFilter, nameFilter
    (keys.indexOf("minEmployees")===-1)? minFilter = false: minFilter = true;
    (keys.indexOf("maxEmployees")===-1)? maxFilter = false: maxFilter = true;
    (keys.indexOf("name")===-1)? nameFilter = false: nameFilter = true;
    // Check if number for min or max is int or throw error
    if (minFilter && !isInt(filters.minEmployees)) {
        
        throw new ExpressError("minEmployees must be a number", 400)
    }
    if (maxFilter && !isInt(filters.maxEmployees)) {
    
        throw new ExpressError("maxEmployees must be a number", 400)
    }

    //Check if max & min filters are >= 0
    if ((isInt(filters.minEmployees) && (parseInt(filters.minEmployees) < 0))
    ||(isInt(filters.maxEmployees) && (parseInt(filters.maxEmployees) < 0))){
        throw new ExpressError("Please enter positive numbers", 400)
    }

    // Check if min filter > max filter
    if (minFilter && maxFilter){
        if (parseInt(filters.minEmployees) > parseInt(filters.maxEmployees)){
            throw new ExpressError("maximum number of employees should be greater than the minimum", 400)
        }
    }
}

function isInt(num){
    //if the string can be converted to int returns true, otherwise false
    let result
    try {
        result = parseInt(num)
    } catch(error) {
        return false 
    }
    if (result){
        return true
    }
    return false
}

module.exports = filterValidate
