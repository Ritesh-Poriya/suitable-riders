module.exports = {
  async up(db, client) {
    const merchantProfiles = await db
      .collection('merchantprofiles')
      .find({})
      .toArray();

    await db.collection('counters').insertOne({
      fieldName: 'businessID',
      collectionName: 'merchantprofiles',
      start: 1000,
      counter: 1000,
      prefix: '',
      suffix: '',
      incrementBy: 1,
      fieldType: 'String',
    });

    for (let i = 0; i < merchantProfiles.length; i++) {
      const businessID = await db
        .collection('counters')
        .findOne({ fieldName: 'businessID' });
      await db
        .collection('merchantprofiles')
        .updateOne(
          { _id: merchantProfiles[i]._id },
          { $set: { businessID: `${businessID.counter}` } },
        );
      await db
        .collection('counters')
        .updateOne(
          { fieldName: 'businessID' },
          { $set: { counter: businessID.counter + 1 } },
        );
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
