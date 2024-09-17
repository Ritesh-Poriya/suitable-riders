export default () => {
  if (!process.env.MAILER_SERVICE) {
    throw new Error('MAILER_SERVICE environment variable is not defined.');
  }
  if (!process.env.MAILER_USER) {
    throw new Error('MAILER_USER environment variable is not defined.');
  }
  if (!process.env.MAILER_PASSWORD) {
    throw new Error('MAILER_PASSWORD environment variable is not defined.');
  }
  return {
    mailer: {
      service: process.env.MAILER_SERVICE,
      user: process.env.MAILER_USER,
      password: process.env.MAILER_PASSWORD,
    },
  };
};
