const request = require("supertest");
const {sqlForPartialUpdate} = require("./sql")

describe('sqlForPartialUpdate', () => {
    test('object with keys identical to table col_names', () => { 
        expect(sqlForPartialUpdate({name: "John", surname: "Parker", age: 32},{})).
        toEqual({setCols: '"name"=$1, "surname"=$2, "age"=$3', values: ['John', 'Parker', 32]})
     })
     test('object with aliases keys', () => { 
        expect(sqlForPartialUpdate({name: "John", surname: "Parker", age: 32},{name:"first_name", surname: "last_name" })).
        toEqual({setCols: '"first_name"=$1, "last_name"=$2, "age"=$3', values: ['John', 'Parker', 32]})
     })
})

