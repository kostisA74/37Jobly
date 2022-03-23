const request = require("supertest");
const filterHelper = require("./filterHelper");
const {sqlForPartialUpdate} = require("./filterHelper")

describe('Test filterHelper: 3 valid Filters', () => {
    const filters = {minEmployees: 45, maxEmployees: 90, name: "Limited"}
    test('Prepared statement', () => {
        expect(filterHelper(filters).prepStat).toEqual(`WHERE num_employees >= $1 AND num_employees <= $2 AND LOWER(name) ILIKE $3`)
    })
    test('Values arg', () => {
        expect(filterHelper(filters).vals).toEqual([45, 90, '%limited%'])
    })
})

describe('Test filterHelper: 1 valid Filter', () => {
    const filters = {minEmployees: 45, jhhjjh: 90, hjjhjh: "Limited"}
    test('Prepared statement', () => {
        expect(filterHelper(filters).prepStat).toEqual(`WHERE num_employees >= $1`)
    })
    test('Values arg', () => {
        expect(filterHelper(filters).vals).toEqual([45])
    })
})

describe('Test No-filtering', () => {
    test('No filtering args passed', () => {
        const filters = {}
        expect(filterHelper(filters).prepStat).toEqual(undefined)
        expect(filterHelper(filters).vals).toEqual(undefined)
    })
})
