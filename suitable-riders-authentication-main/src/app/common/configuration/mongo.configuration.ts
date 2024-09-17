export default () => {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL environment variable is not defined.');
  }
  if (!process.env.MONGO_DB_NAME) {
    throw new Error('MONGO_DB_NAME environment variable is not defined.');
  }
  return {
    database: {
      url: process.env.MONGO_URL,
      name: process.env.MONGO_DB_NAME,
    },
  };
};
