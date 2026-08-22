const express = require("express");
const companyController = require("./company.controller");

const router = express.Router();

// Public routes for company onboarding and login autocomplete
router.post("/", companyController.createCompany);
router.post("/register", companyController.createCompany);
router.get("/search", companyController.searchCompanies);
router.get("/", companyController.searchCompanies);
router.get("/:companyId", companyController.getCompany);

module.exports = router;
