module.exports = {
  async up(db) {
    await db.collection('vehicles').updateMany(
      {},
      {
        $unset: { vehicleBusinessInsuranceExpDate: 1, motDocumentExpDate: 1 },
      },
      false,
      true,
    );
  },

  async down(db) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
