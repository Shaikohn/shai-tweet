import * as repo from './follow.repository.js';

export async function followUser(username, user) {
  const target = await repo.findUserByUsernameLower(username);
  if (!target) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (String(target.id) === String(user.id)) {
    const err = new Error('You cannot follow yourself');
    err.status = 400;
    throw err;
  }

  const existing = await repo.findFollow(user.id, target.id);
  if (existing) {
    const err = new Error('Already following user');
    err.status = 409;
    throw err;
  }

  await repo.createFollow(user.id, target.id);
  return;
}

export async function unfollowUser(username, user) {
  const target = await repo.findUserByUsernameLower(username);
  if (!target) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const existing = await repo.findFollow(user.id, target.id);
  if (!existing) {
    const err = new Error('Follow relationship not found');
    err.status = 404;
    throw err;
  }

  await repo.deleteFollow(user.id, target.id);
  return;
}
