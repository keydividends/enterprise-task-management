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

test('loginUser authenticates the seeded admin account with the documented demo credentials', async () => {
  const result = await loginUser({ email: 'admin@etms.com', password: 'Admin@123' });

  assert.equal(result.user.email, 'admin@etms.com');
  assert.equal(result.user.status, 'ACTIVE');
  assert.ok(result.accessToken);
  assert.ok(result.refreshToken);
});

test('loginUser exposes the team permissions required by the team module', async () => {
  const result = await loginUser({ email: 'admin@etms.com', password: 'Admin@123' });

  assert.ok(result.user.permissions.includes('TEAM_VIEW'));
  assert.ok(result.user.permissions.includes('TEAM_CREATE'));
  assert.ok(result.user.permissions.includes('TEAM_UPDATE'));
  assert.ok(result.user.permissions.includes('TEAM_DELETE'));
  assert.ok(result.user.permissions.includes('TEAM_MANAGE_MEMBERS'));
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

test('forgotPassword does not send email or store token for disabled accounts', async () => {
  const beforeCount = resetTokens.size;
  const result = await forgotPassword({ email: 'disabled@etms.com' });
  assert.equal(result.message, 'If the account exists, reset instructions have been sent');
  assert.equal(resetTokens.size, beforeCount);
});

test('forgotPassword stores a hashed reset token and supports a real reset flow', async () => {
  const beforeCount = resetTokens.size;

  await forgotPassword({ email: 'admin@etms.com' });

  assert.equal(resetTokens.size, beforeCount + 1);

  const latestToken = Array.from(resetTokens.values()).at(-1);
  assert.ok(latestToken);
  assert.match(latestToken.tokenHash, /^[a-f0-9]{64}$/i);
  assert.notEqual(latestToken.tokenHash, latestToken.rawToken || '');

  // Verify successful reset password
  const resetResult = await resetPassword({
    token: latestToken.rawToken,
    newPassword: 'NewPassword@123',
    confirmPassword: 'NewPassword@123',
  });
  assert.equal(resetResult.message, 'Password reset successfully');

  // Verify token is marked as used
  assert.equal(latestToken.used, true);
  assert.ok(latestToken.usedAt);
});

test('resetPassword validates token lifecycle and rejects invalid token format', async () => {
  await assert.rejects(
    () => resetPassword({ token: 'invalid-token', newPassword: 'NewPass@123', confirmPassword: 'NewPass@123' }),
    (error) => {
      assert.equal(error.code, 'RESET_TOKEN_INVALID');
      return true;
    }
  );
});

test('resetPassword rejects already used token', async () => {
  // Create a new token for testing used status
  await forgotPassword({ email: 'admin@etms.com' });
  const latestToken = Array.from(resetTokens.values()).at(-1);

  // Use it once
  await resetPassword({
    token: latestToken.rawToken,
    newPassword: 'AnotherPass@123',
    confirmPassword: 'AnotherPass@123',
  });

  // Try to use it again
  await assert.rejects(
    () => resetPassword({ token: latestToken.rawToken, newPassword: 'ThirdPass@123', confirmPassword: 'ThirdPass@123' }),
    (error) => {
      assert.equal(error.code, 'RESET_TOKEN_INVALID');
      return true;
    }
  );
});

test('resetPassword rejects expired token', async () => {
  // Create a token and modify it to be expired in memory
  await forgotPassword({ email: 'admin@etms.com' });
  const latestToken = Array.from(resetTokens.values()).at(-1);
  latestToken.expiresAt = Date.now() - 1000; // expired 1s ago

  await assert.rejects(
    () => resetPassword({ token: latestToken.rawToken, newPassword: 'ExpiredPass@123', confirmPassword: 'ExpiredPass@123' }),
    (error) => {
      assert.equal(error.code, 'RESET_TOKEN_INVALID');
      return true;
    }
  );
});

test('resetPassword rejects disabled/inactive user', async () => {
  // Directly simulate a token for a disabled user in memory map
  const mockToken = 'disabled-user-reset-token';
  const tokenHash = require('crypto').createHash('sha256').update(mockToken).digest('hex');
  resetTokens.set(tokenHash, {
    userId: 'user_disabled_1',
    tokenHash,
    rawToken: mockToken,
    expiresAt: Date.now() + 15 * 60 * 1000,
    used: false,
  });

  await assert.rejects(
    () => resetPassword({ token: mockToken, newPassword: 'NewPassForDisabled@123', confirmPassword: 'NewPassForDisabled@123' }),
    (error) => {
      assert.equal(error.code, 'RESET_TOKEN_INVALID');
      return true;
    }
  );
});

test('resetPassword invalidates all previous tokens for the user', async () => {
  // Generate two reset tokens for the same user
  await forgotPassword({ email: 'admin@etms.com' });
  const token1 = Array.from(resetTokens.values()).at(-1);

  await forgotPassword({ email: 'admin@etms.com' });
  const token2 = Array.from(resetTokens.values()).at(-1);

  // Both should be in memory, but token1 should have been invalidated when token2 was created
  assert.equal(token1.used, true);
  assert.equal(token2.used, false);

  // Reset password using token2
  await resetPassword({
    token: token2.rawToken,
    newPassword: 'FinalPassword@123',
    confirmPassword: 'FinalPassword@123',
  });

  // Now token2 should also be used
  assert.equal(token2.used, true);
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
    'USER_DELETE',
    'PROJECT_VIEW',
    'PROJECT_CREATE',
    'PROJECT_UPDATE',
    'PROJECT_DELETE',
    'TASK_VIEW',
    'TASK_CREATE',
    'TASK_UPDATE',
    'TASK_DELETE',
    'TEAM_VIEW',
    'TEAM_CREATE',
    'TEAM_UPDATE',
    'TEAM_DELETE',
    'TEAM_MANAGE_MEMBERS',
    'PROJECT_MANAGE_MEMBERS',
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
