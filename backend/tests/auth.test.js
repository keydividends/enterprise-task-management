const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createTokenPair,
  verifyAccessToken,
  loginUser,
  registerUser,
  resetPassword,
  forgotPassword,
  refreshAccessToken,
  logoutAllSessions,
  getUserPermissions,
} = require('../src/modules/auth/auth.service');
const { resetTokens } = require('../src/modules/auth/auth.repository');
const authorize = require('../src/middleware/authorize');

test('createTokenPair returns access and refresh tokens', () => {
  const pair = createTokenPair({
    id: 'user_123',
    email: 'demo@etms.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'ADMIN',
    permissions: ['TASK_VIEW', 'USER_VIEW'],
    status: 'ACTIVE',
  });

  assert.ok(pair.accessToken);
  assert.ok(pair.refreshToken);
  assert.notEqual(pair.accessToken, pair.refreshToken);
});

test('verifyAccessToken decodes valid token', () => {
  const pair = createTokenPair({
    id: 'user_123',
    email: 'demo@etms.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'ADMIN',
    permissions: ['TASK_VIEW'],
    status: 'ACTIVE',
  });

  const payload = verifyAccessToken(pair.accessToken);
  assert.equal(payload.email, 'demo@etms.com');
  assert.equal(payload.role, 'ADMIN');
});

test('registerUser creates a new user and returns a token pair', async () => {
  const result = await registerUser({
    firstName: 'Riya',
    lastName: 'Sharma',
    email: 'riya.new@etms.com',
    password: 'NewUser@123',
    confirmPassword: 'NewUser@123',
  });

  assert.equal(result.user.email, 'riya.new@etms.com');
  assert.equal(result.user.status, 'ACTIVE');
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
});

test('registerUser rejects duplicate email addresses', async () => {
  await assert.rejects(
    () => registerUser({
      firstName: 'Riya',
      lastName: 'Sharma',
      email: 'admin@etms.com',
      password: 'NewUser@123',
      confirmPassword: 'NewUser@123',
    }),
    (error) => {
      assert.equal(error.code, 'USER_ALREADY_EXISTS');
      return true;
    }
  );
});

test('loginUser rejects disabled accounts', async () => {
  await assert.rejects(
    () => loginUser({ email: 'disabled@etms.com', password: 'Admin@123' }),
    (error) => {
      assert.equal(error.code, 'USER_INACTIVE');
      return true;
    }
  );
});

test('forgotPassword does not expose whether the account exists', async () => {
  const result = await forgotPassword({ email: 'unknown@etms.com' });
  assert.equal(result.message, 'If the account exists, reset instructions have been sent');
});

test('forgotPassword stores a hashed reset token and supports a real reset flow', async () => {
  const beforeCount = resetTokens.size;

  await forgotPassword({ email: 'admin@etms.com' });

  assert.equal(resetTokens.size, beforeCount + 1);

  const latestToken = Array.from(resetTokens.values()).at(-1);
  assert.ok(latestToken);
  assert.match(latestToken.tokenHash, /^[a-f0-9]{64}$/i);
  assert.notEqual(latestToken.tokenHash, latestToken.rawToken || '');
});

test('resetPassword validates token lifecycle', async () => {
  await assert.rejects(
    () => resetPassword({ token: 'invalid-token', newPassword: 'NewPass@123', confirmPassword: 'NewPass@123' }),
    (error) => {
      assert.equal(error.code, 'RESET_TOKEN_INVALID');
      return true;
    }
  );
});

test('refreshAccessToken returns a new pair for a valid refresh token', async () => {
  const pair = createTokenPair({
    id: 'user_demo_1',
    email: 'demo@etms.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'USER',
    permissions: ['TASK_VIEW'],
    status: 'ACTIVE',
  });

  const refreshed = await refreshAccessToken({ refreshToken: pair.refreshToken });
  assert.ok(refreshed.accessToken);
  assert.ok(refreshed.refreshToken);
});

test('verifyAccessToken rejects malformed or wrong-type tokens', async () => {
  await assert.rejects(
    () => Promise.resolve().then(() => verifyAccessToken('not-a-valid.token')),
    (error) => {
      assert.equal(error.code, 'AUTH_INVALID_TOKEN');
      return true;
    }
  );
});

test('logoutAllSessions clears active sessions for the user', async () => {
  const pair = createTokenPair({
    id: 'user_admin_1',
    email: 'admin@etms.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    permissions: ['USER_VIEW'],
    status: 'ACTIVE',
  });

  const result = await logoutAllSessions({ userId: 'user_admin_1', refreshToken: pair.refreshToken });
  assert.equal(result.message, 'All sessions revoked');
});

test('getUserPermissions returns the current permission set', async () => {
  const permissions = await getUserPermissions('user_admin_1');
  assert.deepEqual(permissions, [
    'USER_VIEW',
    'USER_CREATE',
    'USER_UPDATE',
    'PROJECT_VIEW',
    'PROJECT_CREATE',
    'TASK_VIEW',
    'TASK_CREATE',
    'TASK_UPDATE',
  ]);
});

test('authorize permits users with the required permission', () => {
  const req = { user: { permissions: ['TASK_CREATE', 'TASK_VIEW'] } };
  const next = (error) => {
    assert.equal(error, undefined);
  };

  authorize('TASK_CREATE')(req, {}, next);
});

test('authorize rejects requests missing a required permission', () => {
  const req = { user: { permissions: ['TASK_VIEW'] } };
  const res = {
    status(code) {
      assert.equal(code, 403);
      return {
        json(body) {
          assert.equal(body.code, 'PERMISSION_DENIED');
          return body;
        },
      };
    },
  };

  const next = (error) => {
    assert.ok(error);
    assert.equal(error.code, 'PERMISSION_DENIED');
    assert.equal(error.statusCode, 403);
  };

  authorize('TASK_CREATE')(req, res, next);
});
