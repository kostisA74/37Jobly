//This function receives an object with filter keys-values pairs and returns sql code to be added to a base query
function filterHelper(filters) {
    const keys_passed = Object.keys(filters)
    //Exclude non-valid filter-keys provided by the user
    const keys = keys_passed.reduce((accum, next)=>{
        if (["minEmployees", "maxEmployees", "name"].indexOf(next) !== -1){
            accum.push(next)
            return accum
        }
        else{
            return accum
        }
    },[])
    //translate filters into sql commands (three possible filters)
    const arr = keys.map((key,id) => {    
        if (key === "minEmployees"){
            return `num_employees > $${id+1}` 
        }else if (key === "maxEmployees"){
            return `num_employees < $${id+1}`
        }else if (key === 'name'){
            return `LOWER(name) ILIKE $${(id+1).toString()}` //case insensitive!
        }
        else return
    })

    //Values arg:
    const arrRight = keys.map(key => {
        return(key === 'name'? "%"+filters[key].toLowerCase()+"%": filters[key])}) //case insensitive!
    
    //For the prepared statement:
    //if there is only one filter field add a WHERE stetement 
    //otherwise join multiple statements with AND
    if (arr.length === 0){
        return ""
    } else if (arr.length ===1) {
        return {prepStat:`WHERE ${arr[0]}`, vals: arrRight}
    } else {
        return {prepStat:`WHERE ${arr.join(" AND ")}`, vals: arrRight}
    }
}

module.exports = filterHelper
       

