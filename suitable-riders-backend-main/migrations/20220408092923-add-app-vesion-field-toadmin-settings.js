module.exports = {
  async up(db, client) {
    await db.collection('adminSettings').updateOne(
      {},
      {
        $set: {
          androidHardUpdateMerchant: '0.0.0',
          androidHardUpdateRider: '1.0.0',
          androidSoftUpdateMerchant: '0.0.0',
          androidSoftUpdateRider: '1.0.0',
          iOSHardUpdate: '1.0.0',
          iOSSoftUpdate: '1.0.0',
        },
      },
    );
  },

  async down(db, client) {
    await db.collection('adminSettings').updateOne(
      {},
      {
        $unset: {
          androidHardUpdateMerchant: 1,
          androidHardUpdateRider: 1,
          androidSoftUpdateMerchant: 1,
          androidSoftUpdateRider: 1,
          iOSHardUpdate: 1,
          iOSSoftUpdate: 1,
        },
      },
    );
  },
};
