const { RQuery } = require("../database/database.setup");

// To fetch the data of properties from database :-> this code fetches property data based on the user's role and returns it in a specific format as a response.
const getPropertyData = async (req, res) => {
  try {
    const userData = await RQuery(
      `select * from users where contactNo = '${req.params.mobile}';`
    );
    var collection = []
    if (userData[0].role == 'Super Admin') {
      collection = await RQuery(`
        SELECT * FROM sakanisv2;
      `);
    } else if (userData[0].role == 'Sub Admin' || userData[0].role == 'Admin') {
      collection = await RQuery(`
        SELECT * FROM sakanisv2 WHERE broker_company_name = '${userData[0].companyName}';
      `);
    } else {
      collection = await RQuery(`
        SELECT * FROM sakanisv2 WHERE broker_phone = '${userData[0].contactNo}';
      `);
    }

    const data = collection;

    const result = data.map((item) => {
      const {
        id,
        referenceNo,
        building_name,
        short_description,
        community,
        sub_community,
        purpose_1,
        purpose_2,
        property_type,
        bedrooms,
        bathrooms,
        size,
        price,
      } = item;

      return {
        property_id: id,
        property_ref_no: size,
        title: short_description,
        community: sub_community + ", " + community,
        purpose: purpose_1,
        type: property_type + ", " + purpose_2,
        bedrooms,
        bathrooms,
        price,
      };
    });

    return res.status(200).send({ status: true, data: result });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: "Internal Server Error" });
  }
};

module.exports = { getPropertyData };


