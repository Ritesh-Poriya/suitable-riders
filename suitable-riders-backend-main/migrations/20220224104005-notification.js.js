module.exports = {
  async up(db) {
    await db.collection('notifications').updateMany(
      {},
      {
        $set: { disabled: false, notes: '' },
      },
    );
  },

  async down(db) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
