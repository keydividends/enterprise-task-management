const bcrypt = require("bcryptjs");
const companyRepository = require("./company.repository");
const { User } = require("../users/user.model");
const { validateCreateCompany } = require("./company.validation");
const { getEffectivePermissions } = require("../auth/rolePermissions");

const createServiceError = (code, message, statusCode = 400) => {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
};

const hashPassword = async (password) => bcrypt.hash(String(password), 10);

const registerCompany = async (payload) => {
  const validated = validateCreateCompany(payload);

  const existingCompany = await companyRepository.findByName(validated.name);
  if (existingCompany) {
    throw createServiceError(
      "COMPANY_ALREADY_EXISTS",
      "A company with this name already exists. Please choose another name or sign in.",
      409
    );
  }

  const existingUser = await User.findOne({ email: validated.email, isDeleted: false });
  if (existingUser) {
    throw createServiceError(
      "USER_EMAIL_ALREADY_EXISTS",
      "An account with this email address already exists. Please use a different email.",
      409
    );
  }

  const passwordHash = await hashPassword(validated.password);

  const company = await companyRepository.createCompany({
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    address: validated.address,
    status: "ACTIVE",
  });

  const companyAdminPermissions = getEffectivePermissions({ role: "COMPANY_ADMIN" });

  const adminUser = await User.create({
    firstName: validated.name,
    lastName: "Admin",
    email: validated.email,
    passwordHash,
    mobile: validated.phone,
    department: "Executive Management",
    title: "Company Administrator",
    role: "COMPANY_ADMIN",
    companyId: company._id,
    companyName: company.name,
    permissions: companyAdminPermissions,
    status: "ACTIVE",
    isDeleted: false,
  });

  await companyRepository.updateCompany(company._id, { adminUserId: adminUser._id });

  return {
    company: {
      id: company._id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      status: company.status,
      createdAt: company.createdAt,
    },
    user: {
      id: adminUser._id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      companyId: company._id,
      companyName: company.name,
    },
  };
};

const searchCompanies = async (query = "", limit = 50) => {
  const companies = await companyRepository.searchCompanies(query, limit);
  return companies.map((c) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    status: c.status,
  }));
};

const getCompanyById = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw createServiceError("COMPANY_NOT_FOUND", "Company not found.", 404);
  }
  return {
    id: company._id,
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    status: company.status,
    adminUserId: company.adminUserId,
    createdAt: company.createdAt,
  };
};

module.exports = {
  registerCompany,
  searchCompanies,
  getCompanyById,
};
