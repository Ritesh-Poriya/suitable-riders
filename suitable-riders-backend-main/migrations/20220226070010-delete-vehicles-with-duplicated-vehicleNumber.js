module.exports = {
  async up(db, client) {
    while (true) {
      const vehicles = await db
        .collection('vehicles')
        .aggregate([
          {
            $group: {
              _id: '$vehicleNumber',
              count: { $sum: 1 },
            },
          },
          {
            $match: {
              count: { $gt: 1 },
            },
          },
        ])
        .toArray();
      console.log(vehicles);
      if (vehicles.length === 0) {
        break;
      }

      for (const vehicle of vehicles) {
        console.log(`Deleting vehicle ${vehicle._id}`);
        await db.collection('vehicles').deleteOne({
          vehicleNumber: vehicle._id,
        });
      }
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
