const companyService = require("./company.service");

const createCompany = async (req, res, next) => {
  try {
    const result = await companyService.registerCompany(req.body);
    return res.status(201).json({
      success: true,
      message: "Company registered successfully. You can now log in.",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const searchCompanies = async (req, res, next) => {
  try {
    const query = String(req.query.query || req.query.search || req.query.q || "").trim();
    const limit = Number(req.query.limit) || 10;
    const companies = await companyService.searchCompanies(query, limit);
    return res.status(200).json({
      success: true,
      data: companies,
    });
  } catch (error) {
    return next(error);
  }
};

const getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.companyId);
    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCompany,
  searchCompanies,
  getCompany,
};
