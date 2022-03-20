const filterValidate = require('./filterValidator')
const {ExpressError} = require('../expressError')

describe('filter validator', () => {
    test('non numeric values for min should throw error', () => {
        const filters = {minEmployees: "ppp"}
        expect(() => {filterValidate(filters)}).toThrow(ExpressError)
    })

    test('non numeric values for max should throw error', () => {
        const filters = {maxEmployees: "hjhjhj"}
        expect(() => {filterValidate(filters)}).toThrow(ExpressError)
    })

    test('negative maxEmployees should trigger error', () => {
        const filters = {maxEmployees: -220}
        expect(() => {filterValidate(filters)}).toThrow(ExpressError)
    })

    test('negative minEmployees should trigger error', () => {
        const filters = {minEmployees: -200}
        expect(() => {filterValidate(filters)}).toThrow(ExpressError)
    })

    test('min value should be less than max value', () =>{
        const filters = {minEmployees: 234, maxEmployees: 100}
        expect(() => {filterValidate(filters)}).toThrow(ExpressError)
    })

    test('valid filters should not trigger an error', () => {
        const filters = {name: "NET", minEmployees: 120, maxEmployees: 200}
        expect(() => {filterValidate(filters)}).not.toThrow(ExpressError)
    })

    test('No filters should not trigger an error', () => {
        const filters = {}
        expect(() => {filterValidate(filters)}).not.toThrow(ExpressError)
    })
})