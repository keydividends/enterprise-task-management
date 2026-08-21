const { Company } = require("./company.model");

const createCompany = async (companyData) => {
  return Company.create(companyData);
};

const findByName = async (name) => {
  if (!name) return null;
  return Company.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    isDeleted: false,
  });
};

const findByEmail = async (email) => {
  if (!email) return null;
  return Company.findOne({
    email: email.toLowerCase().trim(),
    isDeleted: false,
  });
};

const findById = async (companyId) => {
  if (!companyId) return null;
  return Company.findOne({
    _id: companyId,
    isDeleted: false,
  });
};

const searchCompanies = async (query = "", limit = 50) => {
  const filter = {
    isDeleted: false,
    status: "ACTIVE",
  };

  if (query && query.trim()) {
    filter.name = { $regex: query.trim(), $options: "i" };
  }

  return Company.find(filter)
    .select("_id name email phone address status createdAt")
    .sort({ name: 1 })
    .limit(limit)
    .lean();
};

const updateCompany = async (companyId, updates) => {
  return Company.findByIdAndUpdate(
    companyId,
    { $set: updates },
    { new: true }
  );
};

module.exports = {
  createCompany,
  findByName,
  findByEmail,
  findById,
  searchCompanies,
  updateCompany,
};
