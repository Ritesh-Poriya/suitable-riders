module.exports = {
  async up(db) {
    await db.collection('users').updateMany(
      {
        role: {
          $in: ['MERCHANT', 'NOT_VERIFIED_MERCHANT'],
        },
      },
      {
        $set: { isSubscriptionActive: false },
      },
    );
    await db.collection('users').updateMany(
      {
        role: {
          $nin: ['MERCHANT', 'NOT_VERIFIED_MERCHANT'],
        },
      },
      {
        $set: { isSubscriptionActive: true },
      },
    );
  },

  async down(db) {
    await db.collection('users').updateMany(
      {},
      {
        $unset: { isSubscriptionActive: 1 },
      },
    );
  },
};
