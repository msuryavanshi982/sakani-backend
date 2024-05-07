const router = require("express").Router();
const { RQuery, WQuery } = require("../../setups/database/database.setup");

// To create lead :-> This route handles the creation of a lead. It validates the lead data and inserts it into the database.
router.post("/add", async (req, res) => {
  try {
    const {
      sakani_id,
      ref_no,
      name,
      phoneNo,
      email,
      propertyId,
      type,
      community,
      purpose,
      event_type,
      communication_mode,
    } = req.body;
    let createdAt = new Date();

    // Lead data validation
    if (!propertyId || !type || !community || !purpose) {
      return res.status(400).send({
        status: false,
        message: "Incomplete lead data",
      });
    }

    if (!propertyId) {
      return res.status(400).send({
        status: false,
        message: "property Id is required",
      });
    }

    if (!type) {
      return res.status(400).send({
        status: false,
        message: "type is required",
      });
    }

    if (!community) {
      return res.status(400).send({
        status: false,
        message: "community is required",
      });
    }

    if (!purpose) {
      return res.status(400).send({
        status: false,
        message: "purpose is required",
      });
    }

    const lead = {
      sakani_id,
      ref_no,
      name,
      phoneNo: phoneNo || "",
      email: email || "",
      propertyId,
      type,
      community,
      purpose,
      event_type,
      communication_mode,
      createdAt,
    };

    await WQuery(`
      INSERT INTO sakani.leads
      (
        communication_mode,
        community,
        createdAt,
        email,
        event_type,
        name,
        phoneNo,
        propertyId,
        purpose,
        ref_no,
        sakani_id,
        type
      ) VALUES
      (
        '${lead.communication_mode}',
        '${lead.community}',
        '${lead.createdAt}',
        '${lead.email}',
        '${lead.event_type}',
        '${lead.name}',
        '${lead.phoneNo}',
        '${lead.propertyId}',
        '${lead.purpose}',
        '${lead.ref_no}',
        '${lead.sakani_id}',
        '${lead.type}'
      )
    `)
    res
      .status(201)
      .json({ data: lead, message: "lead created successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the lead" });
  }
});

// To get all leads data :-> This route retrieves lead data based on the user's role and company affiliation. Super Admins can access all properties, while others can access properties associated with their company or phone number.
router.get("/all/:mobile", async (req, res) => {
  try {

    const userData = await RQuery(
      `SELECT * FROM users WHERE contactNo = '${req.params.mobile}';`
    );
      console.log(userData);
    if (userData.length === 0) {
      return res.status(404).send({
        status: false,
        error: "User not found",
        path: req.path,
      });
    }
    var allProperties = "ALL PROPERTIES";
    if (userData[0].role == "Super Admin") {
      var allProperties = await RQuery(`
        SELECT
          leads.*
        FROM
          leads INNER JOIN
          sakanisv2 ON leads.propertyId = sakanisv2.id
      `);
    } else if (userData[0].role != "Sub Admin" || userData[0].role != "Admin") {
      var allProperties = await RQuery(`
        SELECT
          leads.*
        FROM
          leads INNER JOIN
          sakanisv2 ON leads.propertyId = sakanisv2.id
        WHERE
          sakanisv2.broker_company_name = '${userData[0].companyName}'
      `);
    } else {
      var allProperties = await RQuery(`
        SELECT
          leads.*
        FROM
          leads INNER JOIN
          sakanisv2 ON leads.propertyId = sakanisv2.id
        WHERE
          sakanisv2.broker_phone = '${userData[0].contactNo}'
      `);
    }
    if (
      allProperties.length == 0
    ) {
      return res.status(404).send({
        status: false,
        error: "No properties found for the user",
        path: req.path,
      });
    }

    data = allProperties
  
    return res.status(200).send({
      status: true,
      message: "ALL leads data fetched successfully",
      path: req.path,
      data: data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      error: err.message,
      path: req.path,
    });
  }
});

module.exports = router;
