module.exports = {
  async up(db, client) {
    await db.collection('merchantprofiles').updateMany(
      { isDeleted: false, 'businessInfo.businessEntity': { $exists: false } },
      {
        $set: {
          'businessInfo.businessEntity': 'LIMITED_COMPANY',
        },
      },
    );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
