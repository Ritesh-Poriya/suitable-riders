module.exports = {
  async up(db) {
    const vehicles = await db.collection('vehicles').find({}).toArray();
    let i = 100000;
    for (let vehicle of vehicles) {
      await db.collection('vehicles').deleteOne({ _id: vehicle._id });
      if (vehicle) {
        await db.collection('vehicles').insertOne({
          vehicleType: vehicle.vehicleType,
          vehicleRegistrationNumber: vehicle.vehicleRegistrationNumber,
          brandMakeModelYear: vehicle.brandMakeModelYear,
          motDocumentExpDate: vehicle.motDocumentExpDate,
          motDocument: vehicle.motDocument,
          vehicleBusinessInsuranceExpDate:
            vehicle.vehicleBusinessInsuranceExpDate,
          vehicleBusinessInsuranceDocument:
            vehicle.vehicleBusinessInsuranceDocument,
          ownerID: vehicle.ownerID,
          isDeleted: vehicle.isDeleted,
          isSelected: vehicle.isSelected,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
          vehicleNumber: String(i),
        });
      }
      i++;
    }
  },

  async down(db) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
