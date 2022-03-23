const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
//This function receives an object with key-value pairs and an object with mapping of first object's keys 
//to sql_table col_names if different (mapping).
//The function returns an object of the form {setCols: `key1 = $1, key2 = $2`, values: [val1, val2 ]}
//It can be plugged in sql queries of the form: `UPDATE table_name SET key1 = $1, key2 = $2`, [val1, val2 ]  

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) => 
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

