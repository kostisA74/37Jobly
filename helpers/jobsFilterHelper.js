//This function receives an object with filter keys-values pairs and returns sql code to be added to a base query
//It is used in the Job model
function jobsFilterHelper(filters) {
    const keys_passed = Object.keys(filters)
    //Exclude non-valid filter-keys provided by the user
    const keys = keys_passed.reduce((accum, next)=>{
        if (["minSalary", "hasEquity", "title"].indexOf(next) !== -1){
            accum.push(next)
            return accum
        }
        else{
            return accum
        }
    },[])
    //translate filters into sql commands (three possible filters)
    const arr = keys.map((key,id) => {    
        if (key === "minSalary"){
            return `salary >= $${id+1}` 
        }else if (key === 'title'){
            return `LOWER(title) ILIKE $${(id+1).toString()}` //case insensitive!
        }else if (key === "hasEquity"){
            if (filters[key] === true){
                return `equity IS NOT null`
            }
        }else return
    })

    //Values arg:
    const arrRight = keys.map(key => {
        return(key === 'title'? "%"+filters[key].toLowerCase()+"%": filters[key])}) //case insensitive!
    
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

module.exports = jobsFilterHelper