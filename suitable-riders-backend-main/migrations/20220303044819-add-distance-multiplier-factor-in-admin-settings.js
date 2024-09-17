module.exports = {
  async up(db) {
    await db.collection('adminSettings').updateOne(
      {},
      {
        $set: {
          distanceMultiplierFactor: 1.2,
        },
      },
    );
  },

  async down(db) {
    await db.collection('adminSettings').updateOne(
      {},
      {
        $unset: {
          distanceMultiplierFactor: 1,
        },
      },
    );
  },
};
