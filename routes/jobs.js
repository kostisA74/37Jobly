"use strict";

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

router.post("/", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });

  router.get("/", async function (req, res, next) {
    try {
      const filters = req.query
      // validate filters if any
      if (req.query.minSalary){
        const res = parseInt(req.query.minSalary)
        if (!res){
            throw new ExpressError("minimum salary must be a positive integer number", 400)
        }      
      }
      // if there are no filters in the q-string, this behaves like get-all
      const jobs = await Job.filter(filters);
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;