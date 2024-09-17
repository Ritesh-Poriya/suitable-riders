module.exports = {
  async up(db) {
    await db.collection('adminSettings').update(
      {},
      {
        $set: { deliveryBufferInMinutes: 0 },
      },
    );
  },

  async down(db) {
    await db.collection('adminSettings').update(
      {},
      {
        $unset: { deliveryBufferInMinutes: 1 },
      },
    );
  },
};
