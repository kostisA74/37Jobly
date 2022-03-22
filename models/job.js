"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {sqlForPartialUpdate} = require('../helpers/sql')

class Job {
    static async create({ company_handle, title, salary, equity }) {
        const duplicateCheck = await db.query(
              `SELECT company_handle, title
               FROM jobs
               WHERE company_handle = $1 AND title = $2;`, 
            [company_handle, title]);
        if (duplicateCheck.rows[0])
          throw new BadRequestError(`Duplicate job: ${title} at ${company_handle}`);
        const result = await db.query(
            `INSERT INTO jobs
            (company_handle, title, salary, equity)
            VALUES ($1, $2, $3, $4)
            RETURNING company_handle, title, salary, CAST(equity AS Float);`,
        [
            company_handle,
            title,
            salary,
            equity
        ],
        );
        const job = result.rows[0];
        return job;
    }

    static async findAll() {
        const jobsRes = await db.query(
              `SELECT company_handle,
                      title,
                      salary,
                      CAST(equity as FLOAT)
               FROM jobs
               ORDER BY title`);
        return jobsRes.rows;
      }

      static async getById(id) {
        const jobRes = await db.query(
              `SELECT company_handle,
                      title,
                      salary,
                      CAST(equity AS FLOAT)
               FROM jobs
               WHERE id = $1`,
            [id]);
    
        const job = jobRes.rows[0];
    
        if (!job) throw new NotFoundError(`No job with id: ${id}`);
    
        return job;
      }

      static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data,{
            title: "title",
            salary: "salary",
            equity: "equity",
            id: "id"
          });
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${handleVarIdx} 
                          RETURNING 
                                    id,    
                                    company_handle, 
                                    title, 
                                    salary, 
                                    CAST(equity AS FLOAT)`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job with id: ${id}`);
    
        return job;
      }

      static async remove(id) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE id = $1
               RETURNING id`,
            [id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job with id: ${id}`);
      }

}

module.exports = Job

// INSERT INTO jobs
//             (company_handle, title, salary, equity)
//             VALUES ('c1', 'blah', 30000, 0.8)
//             RETURNING company_handle, title, salary, CAST(equity AS Float);