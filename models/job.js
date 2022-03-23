"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const {sqlForPartialUpdate} = require('../helpers/sql')
const jobsFilterHelper = require('../helpers/jobsFilterHelper')

class Job {
/** Create a job (from data), update db, return new job data.
   *
   * data should be { company_handle, title, salary, equity }
   *
   * Returns { id, company_handle, title, salary, equity }
   *
   * Throws BadRequestError if job with same title & company_handle already in database.
   * */

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

/** Find all jobs.
   *
   * Returns [{ id, title, company_handler, salary, equity }, ...]
   * */

    static async findAll() {
        const jobsRes = await db.query(
              `SELECT id,
                      company_handle,
                      title,
                      salary,
                      CAST(equity as FLOAT)
               FROM jobs
               ORDER BY title`);
        return jobsRes.rows;
      }
  /** Filter jobs based on title (case-insensitive), minimum salary and equity (if true gets only jobs with equity) */

      static async filter(filters) {
        const filtering = jobsFilterHelper(filters)
        const jobsRes = await db.query(
          `SELECT id,
                  company_handle,
                  title,
                  salary,
                  CAST(equity AS FLOAT)
           FROM jobs
           ${filtering.prepStat}
           ORDER BY title`, filtering.vals)
        return jobsRes.rows;  
      }

/** Given a job id, return data about the job.
   *
   * Returns { company_handle, title, salary, equity }
   *
   * Throws NotFoundError if not found.
   **/

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

/** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {salary, equity, title}
   *
   * Returns {id, company_handle, title, salary, equity}
   *
   * Throws NotFoundError if not found.
   */
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

/** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

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