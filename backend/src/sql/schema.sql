CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,

    bio VARCHAR(160),
    avatar_url TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- TWEETS

CREATE TABLE tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    image_url TEXT,

    parent_tweet_id UUID REFERENCES tweets(id) ON DELETE SET NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- FOLLOWS

CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (follower_id, following_id),

    CONSTRAINT follows_no_self_follow
        CHECK (follower_id <> following_id)
);

-- LIKES

CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, tweet_id)
);

-- INDEXES

CREATE INDEX idx_tweets_user_id
    ON tweets(user_id);

CREATE INDEX idx_tweets_parent_tweet_id
    ON tweets(parent_tweet_id);

CREATE INDEX idx_tweets_created_at
    ON tweets(created_at DESC);

CREATE INDEX idx_tweets_user_created
    ON tweets(user_id, created_at DESC);

CREATE INDEX idx_follows_follower_id
    ON follows(follower_id);

CREATE INDEX idx_follows_following_id
    ON follows(following_id);

CREATE INDEX idx_likes_tweet_id
    ON likes(tweet_id);

CREATE INDEX idx_likes_user_id
    ON likes(user_id);