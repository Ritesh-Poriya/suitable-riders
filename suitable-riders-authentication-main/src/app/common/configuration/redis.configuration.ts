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
  return {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  };
};
