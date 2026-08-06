const test = require('node:test');
const assert = require('node:assert/strict');

const repository = require('../src/modules/roles/role.repository');
const Role = require('../src/modules/roles/role.model');

const originalFindById = Role.findById;
const originalFindOne = Role.findOne;

test('getRoleById returns role by normalized name when invalid ObjectId is passed', async () => {
  let receivedQuery;
  Role.findById = async () => null;
  Role.findOne = async (query) => {
    receivedQuery = query;
    return { _id: 'role_admin', name: 'ADMIN' };
  };

  try {
    const result = await repository.getRoleById('_admin');
    assert.deepEqual(result, { _id: 'role_admin', name: 'ADMIN' });
    assert.deepEqual(receivedQuery, { name: 'ADMIN' });
  } finally {
    Role.findById = originalFindById;
    Role.findOne = originalFindOne;
  }
});
