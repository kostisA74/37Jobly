"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");
const { ExpressError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", function () {
    const newJob = {
      title: "CFO",
      company_handle: "c2",
      salary: 80000,
      equity: 0.78
    };
  
    test("ok for admins", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        job: newJob,
      });
    });
  
    test("fails for users", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send(newJob)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("bad request with missing data", async function () {
      const resp = await request(app)
          .post("/jobs")
          .send({
            salary: 70000,
            title: "CEO",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(400);
    });
})

describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
      expect(resp.body).toEqual({
        jobs:
        [
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
            { id: 3,
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
          ]
      })
    });
  
    test("3 valid filters", async () => {
        const resp = await request(app).get("/jobs/?title=DEV&minSalary=40000&equity=false")
        expect(resp.body).toEqual({
          jobs:
              [
                {
                  id: 4,
                  company_handle: "c1",
                  title: "developer",
                  salary: 45000,
                  equity: null
                }
              ]
        })
    })
  
    test("min salary filter with non-int value returns error", async () => {
      const resp = await request(app).get("/jobs/?minSalary=a")
      expect(resp.status).toEqual(400)
      expect(resp.body.error.message).toEqual('minimum salary must be a positive integer number')
    })
  
    test('filter by title is case-insensitive', async () => {
      const resp1 = await request(app).get("/jobs/?title=ANaLysT")
      const resp2 = await request(app).get("/jobs/?title=analyst")
      expect(resp1.body).toEqual(resp2.body)
      expect(resp1.body).toEqual({
        jobs:
            [
              {
                id: 1,
                company_handle: "c1",
                title: "Financial Analyst",
                salary: 35000,
                equity: 0.86
              }
            ]
      })
    })
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.statusCode).toEqual(500);
    });
  });

  describe("GET /jobs/:id", function () {
    test("works for anon", async function () {
      const resp = await request(app).get(`/jobs/1`);
      expect(resp.body).toEqual({
          job: 
            {
              company_handle: "c1",
              equity: 0.86,
              salary: 35000,
              title: "Financial Analyst"
            }
      });
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app).get(`/job/90`);
      expect(resp.statusCode).toEqual(404);
    });
  });

  describe("PATCH /jobs/:id", function () {
    test("works for admins", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            title: "Business Analyst",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.body).toEqual({
        job: {
          id: 1,
          company_handle: "c1",
          title: "Business Analyst",
          salary: 35000,
          equity: 0.86
        },
      });
    });
  
    test("fails for users", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            title: "Finance Partner",
          })
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.status).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            name: "C1-new",
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found on no such job", async function () {
      const resp = await request(app)
          .patch(`/jobs/90`)
          .send({
            title: "new nope",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on company_handle change attempt", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            company_handle: "c1-new",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/1`)
          .send({
            salary: "30000€",
          })
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(400);
    });
  });

  describe("DELETE /jobs/:id", function () {
    test("works for admins", async function () {
      const resp = await request(app)
          .delete(`/jobs/1`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.body).toEqual({ deleted: "1" });
    });
  
    test("fails for users", async function () {
      const resp = await request(app)
          .delete(`/jobs/1`)
          .set("authorization", `Bearer ${u1Token}`);
      expect(resp.status).toEqual(401);
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .delete(`/jobs/2`);
      expect(resp.statusCode).toEqual(401);
    });
  
    test("not found for no such job", async function () {
      const resp = await request(app)
          .delete(`/jobs/80`)
          .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(404);
    });
  });