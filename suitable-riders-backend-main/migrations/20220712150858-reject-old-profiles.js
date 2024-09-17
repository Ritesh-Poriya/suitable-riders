module.exports = {
  async up(db, client) {
    await db.collection('driverprofiles').update(
      {},
      {
        $set: {
          verificationStatus: 'REJECTED',
          docsVerificationStatus: {
            vehicle: { status: 'REJECTED', message: 'Please submit details.' },
            license: { status: 'REJECTED', message: 'Please submit details.' },
            address: { status: 'REJECTED', message: 'Please submit details.' },
          },
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
