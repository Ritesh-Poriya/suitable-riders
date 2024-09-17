export default () => {
  if (!process.env.REDIS_HOST) {
    throw new Error('HOST_URL is not defined');
  }
  if (!process.env.REDIS_PORT) {
    throw new Error('PORT is not defined');
  } else {
    const port = parseInt(process.env.REDIS_PORT, 10);
    if (isNaN(port)) {
      throw new Error('PORT is not a number');
    }
  }
  if (!process.env.REDIS_KEY_PREFIX) {
    throw new Error('REDIS_KEY_PREFIX is not defined');
  }
  if (!process.env.REDIS_DB) {
    throw new Error('REDIS_DB is not defined');
  } else {
    const db = parseInt(process.env.REDIS_DB, 10);
    if (isNaN(db)) {
      throw new Error('REDIS_DB is not a number');
    }
  }
  return {
    redisDB: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB || 0,
      keyPrefix: process.env.REDIS_KEY_PREFIX || '',
    },
  };
};
