module.exports = {
  async up(db) {
    const settings = await db.collection('settings').findOne({});
    if (!settings) {
      db.collection('adminSettings').insertOne({
        minimumJobPrice: [
          {
            minimumMiles: 0.0,
            maximumMiles: 3.0,
            minimumCharge: 4.0,
          },
          {
            minimumMiles: 3.0,
            maximumMiles: 4.0,
            minimumCharge: 4.5,
          },
          {
            minimumMiles: 4.0,
            maximumMiles: 5.0,
            minimumCharge: 5.0,
          },
        ],
        sendJobToNextNearestDriverInSeconds: 60,
        makeJobPublicAfterSentToNoOfDrivers: 3,
        findNearbyDriversWithinMiles: 5.0,
        deliveryBufferInPercentage: 10.0,
        pickupBufferTimeInMinutes: 5.0,
      });
    }
  },

  async down(db) {
    await db.collection('adminSettings').deleteOne({});
  },
};
