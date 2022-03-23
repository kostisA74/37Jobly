const request = require("supertest");
const jobsFilterHelper = require("./jobsFilterHelper");
const {sqlForPartialUpdate} = require("./filterHelper")

describe('Test jobsFilterHelper: 3 valid Filters', () => {
    const filters = {minSalary: 50000, hasEquity: true, title: "Analyst"}
    test('Prepared statement', () => {
        expect(jobsFilterHelper(filters).prepStat).toEqual(`WHERE salary >= $1 AND equity IS NOT null AND LOWER(title) ILIKE $3`)
    })
    test('Values arg', () => {
        expect(jobsFilterHelper(filters).vals).toEqual([50000, true, '%analyst%'])
    })
})

describe('Test jobsFilterHelper: 1 valid Filter', () => {
    const filters = {minSalary: 50000, jhhjjh: 90, hjjhjh: "Limited"}
    test('Prepared statement', () => {
        expect(jobsFilterHelper(filters).prepStat).toEqual(`WHERE salary >= $1`)
    })
    test('Values arg', () => {
        expect(jobsFilterHelper(filters).vals).toEqual([50000])
    })
})

describe('Test No-filtering', () => {
    test('No filtering args passed', () => {
        const filters = {}
        expect(jobsFilterHelper(filters).prepStat).toEqual(undefined)
        expect(jobsFilterHelper(filters).vals).toEqual(undefined)
    })
})