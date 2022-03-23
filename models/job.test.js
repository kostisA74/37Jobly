"use strict";

const {sqlForPartialUpdate} = require('../helpers/sql')
const db = require("../db.js");

const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("create",  () => {
    const newJob = { company_handle: "c1", title: "Sales Analyst", salary: 50000, equity: 0.8 };
  
    test("works", async function () {
      let job = await Job.create(newJob);
      
      expect(job).toEqual(newJob);
      
      const result = await db.query(
            `SELECT company_handle, title, salary, CAST(equity AS FLOAT)
             FROM jobs
             WHERE company_handle = 'c1' AND title = 'Sales Analyst'`);
      
      expect(result.rows).toEqual([
        {
          company_handle: "c1",
          title: "Sales Analyst",
          salary: 50000,
          equity: 0.8,
        },
      ]);
    });
  
    test("bad request with dupe", async function () {
      try {
        await Job.create(newJob);
        await Job.create(newJob);
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

  describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          id: 1,
          company_handle: "c1",
          title: "Financial Analyst",
          salary: 35000,
          equity: 0.86
        },
        {
          id: 2,
          company_handle: "c2",
          title: "HR manager",
          salary: 52000,
          equity: 0.9
        },
        {
          id: 3,
          company_handle: "c3",
          title: "Salesman",
          salary: 38000,
          equity: null
        },
        {
          id: 4,
          company_handle: "c1",
          title: "developer",
          salary: 45000,
          equity: null
        }
      ]);
    });
  });

  describe("getById", function () {
    test("works", async function () {
      let job = await Job.getById(1);
      expect(job).toEqual({
        company_handle: "c1",
        title: "Financial Analyst",
        salary: 35000,
        equity: 0.86
      });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.getById(80);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });

  describe("update", function () {
    const updateData = {
      title: "Business Analyst",
      salary: 49000,
      equity: 0.7
    };
  
    test("works", async function () {
      let job = await Job.update(1, updateData);
      expect(job).toEqual({id: 1, company_handle: "c1", ...updateData});
  
      const result = await db.query(
            `SELECT id, company_handle, title, salary, CAST(equity AS FLOAT)
             FROM jobs
             WHERE id = 1`);
      expect(result.rows).toEqual([{
        id: 1,
        company_handle: "c1",
        title: "Business Analyst",
        salary: 49000,
        equity: 0.7
      }]);
    });
  
    test("works: null fields", async function () {
      const updateDataSetNulls = {
        salary: null,
        equity: null
      };
  
      let job = await Job.update(1, updateDataSetNulls);
      expect(job).toEqual({
        id: 1,
        company_handle: "c1",
        title: "Financial Analyst",
        ...updateDataSetNulls,
      });
  
      const result = await db.query(
            `SELECT id, company_handle, title, salary, equity
             FROM jobs
             WHERE id = 1`);
      expect(result.rows).toEqual([{
        id: 1,
        company_handle: "c1",
        title: "Financial Analyst",
        salary: null,
        equity: null
      }]);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.update(90, updateData);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request with no data", async function () {
      try {
        await Job.update(1, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });

  describe("remove", function () {
    test("works", async function () {
      await Job.remove(2);
      const res = await db.query(
          "SELECT id FROM jobs WHERE id='2'");
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(100);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  })