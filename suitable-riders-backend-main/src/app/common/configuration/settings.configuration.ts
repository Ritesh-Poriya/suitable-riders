import mongoose from 'mongoose';

export default async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const platformSettings = await mongoose.connection
    .collection('authPlatformSettings')
    .findOne({});

  await mongoose.disconnect();
  process.env.PLATFORM_SETTINGS = JSON.stringify(platformSettings);
  delete platformSettings._id;
  let settings: any;
  if (process.env.NODE_ENV === 'prod') {
    settings = {
      ...platformSettings,
    };
  } else {
    if (process.env.NODE_ENV === 'local') {
      platformSettings.dev = {
        ...platformSettings.dev,
        ...platformSettings.local,
        IPBlocking: {
          ...platformSettings.dev.IPBlocking,
          ...platformSettings.local?.IPBlocking,
        },
      };
    }
    settings = {
      ...platformSettings,
      ...platformSettings.dev,
      IPBlocking: {
        ...platformSettings.IPBlocking,
        ...platformSettings.dev.IPBlocking,
      },
    };
  }
  delete settings.dev;
  delete settings.local;
  return {
    settings: settings,
  };
};
