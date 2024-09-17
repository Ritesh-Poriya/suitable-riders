/**
 * Database migration for merchant profile
 */
module.exports = {
  async up(db) {
    const merchantProfiles = await db
      .collection('merchantprofiles')
      .find({})
      .toArray();
    for (let profile of merchantProfiles) {
      await db.collection('merchantprofiles').deleteOne({ _id: profile._id });
      if (profile) {
        await db.collection('merchantprofiles').insertOne({
          businessName: profile.businessName,
          profileImage: profile.profileImage,
          email: profile.email,
          phoneNo: profile.phoneNo,
          address: {
            formattedAddress: profile.formattedAddress,
            postalCode: profile.postalCode,
            location: profile.location,
            additionalAddressNotes: profile.additionalAddressNotes,
          },
          VATCertificateInfo: {
            VATCertificate: profile.VATCertificate,
            VATCertificateStatus: 'PENDING',
            message: '',
          },
          TaxCertificateInfo: {
            TaxCertificate: profile.TaxCertificate,
            TaxCertificateStatus: 'PENDING',
            message: '',
          },
          photoIDInfo: {
            photoID: profile.photoID,
            photoIDStatus: 'PENDING',
            message: '',
          },
          isContractAccepted: true,
        });
      }
    }
  },

  async down(db) {
    //Not required
  },
};
