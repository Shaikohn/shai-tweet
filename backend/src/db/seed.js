import bcrypt from 'bcrypt';
import pool from '../config/database.js';

async function seed() {
  console.log('Seeding database...');

  try {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');

    const plainPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const usersData = [
      { username: 'shai', email: 'shai@example.com', displayName: 'Shai', bio: 'Building ShaiTweet — one tweet at a time', avatarUrl: null },
      { username: 'ana', email: 'ana@example.com', displayName: 'Ana', bio: 'Frontend dev tinkering with Vite', avatarUrl: null },
      { username: 'leo', email: 'leo@example.com', displayName: 'Leo', bio: 'Backend engineer writing SQL', avatarUrl: null },
      { username: 'mica', email: 'mica@example.com', displayName: 'Mica', bio: 'QA and tests enthusiast', avatarUrl: null },
      { username: 'tomi', email: 'tomi@example.com', displayName: 'Tomi', bio: 'Design and UX for social apps', avatarUrl: null },
    ];

    const users = {};
    for (const u of usersData) {
      const res = await pool.query(
        `INSERT INTO users (email, password_hash, username, display_name, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [u.email, passwordHash, u.username, u.displayName, u.bio, u.avatarUrl]
      );
      users[u.username] = res.rows[0].id;
    }

    const follows = [
      ['shai', 'ana'],
      ['shai', 'leo'],
      ['ana', 'shai'],
      ['leo', 'shai'],
      ['mica', 'ana'],
      ['tomi', 'shai'],
    ];

    for (const [follower, following] of follows) {
      await pool.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)`,
        [users[follower], users[following]]
      );
    }

    const tweetContents = {
      shai: ['Working on ShaiTweet backend today', 'Writing integration tests for pagination'],
      ana: ['Styling the feed with CSS', 'Polishing the profile page'],
      leo: ['Optimizing SQL queries', 'Adding likes count to tweet responses'],
      mica: ['Writing end-to-end tests', 'Testing tweet replies behavior'],
      tomi: ['Designing the mobile layout', 'Improving avatar upload UI'],
    };

    const tweetsByUser = {};
    for (const username of Object.keys(tweetContents)) {
      tweetsByUser[username] = [];
      for (const content of tweetContents[username]) {
        const r = await pool.query(
          `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id) VALUES ($1, $2, NULL, NULL) RETURNING id`,
          [users[username], content]
        );
        tweetsByUser[username].push(r.rows[0].id);
      }
    }

    const replies = [];
    const shaiT1 = tweetsByUser.shai[0];
    const anaT1 = tweetsByUser.ana[0];
    const leoT1 = tweetsByUser.leo[0];
    const micaT1 = tweetsByUser.mica[0];

    let r = await pool.query(
      `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
      [users.ana, 'Nice backend work, @shai!', shaiT1]
    );
    replies.push(r.rows[0].id);

    r = await pool.query(
      `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
      [users.leo, 'I can help optimize that query.', shaiT1]
    );
    replies.push(r.rows[0].id);

    r = await pool.query(
      `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
      [users.mica, 'Looks great! I will test the UI.', anaT1]
    );
    replies.push(r.rows[0].id);

    r = await pool.query(
      `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id) VALUES ($1, $2, NULL, $3) RETURNING id`,
      [users.tomi, 'Nice indexing tips!', leoT1]
    );
    replies.push(r.rows[0].id);

    const likes = [
      [users.ana, shaiT1],
      [users.leo, shaiT1],
      [users.tomi, shaiT1],
      [users.shai, anaT1],
      [users.mica, leoT1],
      [users.ana, leoT1],
      [users.shai, tweetsByUser.leo[1]],
    ];

    for (const [userId, tweetId] of likes) {
      await pool.query(`INSERT INTO likes (user_id, tweet_id) VALUES ($1, $2)`, [userId, tweetId]);
    }

    const usersCount = Number((await pool.query('SELECT COUNT(*) FROM users')).rows[0].count);
    const tweetsCount = Number((await pool.query('SELECT COUNT(*) FROM tweets')).rows[0].count);
    const followsCount = Number((await pool.query('SELECT COUNT(*) FROM follows')).rows[0].count);
    const likesCount = Number((await pool.query('SELECT COUNT(*) FROM likes')).rows[0].count);

    console.log('Seed completed successfully');
    console.log(`Users: ${usersCount}`);
    console.log(`Tweets: ${tweetsCount}`);
    console.log(`Follows: ${followsCount}`);
    console.log(`Likes: ${likesCount}`);

    await pool.end();
  } catch (err) {
    console.error('Seeding failed:', err);
    try {
      await pool.end();
    } catch (e) {
      console.error('Error closing pool after failure:', e);
    }
    process.exit(1);
  }
}

seed();
