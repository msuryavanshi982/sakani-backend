/*
 importing RQuery and WQuery, from a module located at "../database/database.setup"
*/
const { RQuery, WQuery } = require("../database/database.setup");

// email validation : ->
const isValidEmail = function (value) {
  return /[a-zA-Z]@(gmail)\.com\b$/g.test(value);
};

// To add agent: ->
/*function addAgent, adds a new agent to a database. It first checks if the agent's email already exists in the database. If not, it inserts the agent's information into the database. The function returns a success message if the agent is added or an error message if there are issues.*/
const addAgent = async (
  password,
  firstname,
  lastname,
  BRN,
  email,
  contactNo,
  whatsapp,
  bio,
  linkedin,
  instagram,
  companyName
) => {
  const checkExistingAgent = await RQuery(`
        SELECT
            *
        FROM
            sakani.users
        WHERE          
            email = '${email}'
    `);
  //email validation
  if (!email)
    return {
      flag: false,
      message: "Email is required",
    };

  // if (!isValidEmail(email.trim()))
  //   return {
  //     flag: false,
  //     message: "Email is not valid. Email only can be created with @gmail.com domain",
  //   };

  if (checkExistingAgent.length > 0) {
    return {
      flag: false,
      message: "Email Already Exists",
    };
  } else {
    const result = WQuery(`
            INSERT INTO
                users
            (
             username, password, firstname, lastname, BRN, email, companyName, contactNo, createdAt, whatsapp, bio, linkedin, instagram, role ) VALUES ('${
               email.split("@")[0]
             }', '${password}', '${firstname}', '${lastname}', '${BRN}', '${email}', '${companyName}', '${contactNo}', NOW(), '${whatsapp}', '${bio}', '${linkedin}', '${instagram}', 'Agent')
        `);

    return {
      flag: true,
      message: result,
    };
  }
};

// To get agent : ->
/* this function fetches agent data from a database based on the user's role and company name, returning the results or an error message if no data is found. */
const getAllAgents = async (companyName, mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  var agents = [];
  if (userData[0].role == "Super Admin") {
    agents = await RQuery(`
    SELECT
      id,
      firstname,
      lastname,
      concat(firstname, ' ', ifnull(lastname, '')) as fullname,
      email,
      BRN,
      whatsapp,
      bio,
      linkedin,
      instagram,
      createdAt,
      updatedAt,
      companyName,
      ifnull(A.ids, 0) as propertyCount,
      ifnull(B.ids, 0) as leadCount
    FROM
      sakani.users as us
      LEFT JOIN (
          SELECT
              count(sakanisv2.id) as ids,
              broker_company_name
          FROM
              sakanisv2
          GROUP BY
            broker_company_name
      ) A ON us.companyName = A.broker_company_name
      LEFT JOIN (
          SELECT
              count(leads.id) as ids,
              broker_company_name
          FROM
              leads
              INNER JOIN sakanisv2 ON sakanisv2.id = leads.propertyId
          GROUP BY
              sakanisv2.broker_company_name
      ) B ON us.companyName = B.broker_company_name
    WHERE
      role = 'Agency';
  `);
  } else {
    agents = await RQuery(`
    SELECT
      id,
      firstname,
      lastname,
      concat(firstname, ' ', ifnull(lastname, '')) as fullname,
      email,
      contactNo,
      BRN,
      whatsapp,
      bio,
      linkedin,
      instagram,
      createdAt,
      updatedAt,
      companyName,
      ifnull(A.ids,0) as propertyCount,
      ifnull(B.ids,0) as leadCount
    FROM
      sakani.users as us
      LEFT JOIN (
          SELECT
              count(sakanisv2.id) as ids,
              broker_phone
          FROM
              sakanisv2
          WHERE
              broker_company_name = '${companyName}'
          GROUP BY
              broker_phone
      ) A ON us.contactNo = A.broker_phone
      LEFT JOIN (
          SELECT
              count(leads.id) as ids,
              broker_phone
          FROM
              leads
              INNER JOIN sakanisv2 ON sakanisv2.id = leads.propertyId
          WHERE
              sakanisv2.broker_company_name = '${companyName}'
          GROUP BY
              sakanisv2.broker_phone
      ) B ON us.contactNo = B.broker_phone
    WHERE
      role = 'Agent'
      AND companyName = '${companyName}';
  `);
  }

  if (agents.length === 0) {
    return {
      flag: false,
      message: "Data doesn't exist",
    };
  } else {
    return {
      flag: true,
      message: "Required data",
      data: agents,
    };
  }
};

// To get agent information by agent id: -
/* this code retrieves various data related to an agent based on their mobile number and role, returning the results or an error message if no data is found. */
const getAgentById = async (req, res) => {
  const mobileNos = req.body.mobileNo;

  const userData = await RQuery(
    `select * from users where contactNo = '${mobileNos}';`
  );
  var [agentData, leadData, propertyData] = [0, 0, 0, 0];
  if (userData[0].role == "Super Admin") {
    [agentData, leadData, propertyData] = await Promise.all([
      RQuery(`
        SELECT
          *
        FROM
          sakani.users
        WHERE
          contactNo = '${req.body.mobileNo}';
      `),
      RQuery(`
        SELECT
          leads.*
        FROM
          leads INNER JOIN
          sakanisv2 ON leads.propertyId = sakanisv2.id
        WHERE
          sakanisv2.broker_company_name = '${userData[0].companyName}'
      `),
      RQuery(`
      SELECT
        *
      FROM
        sakanisv2
      WHERE
        sakanisv2.broker_company_name = '${userData[0].companyName}'
      `),
    ]);
  } else {
    [agentData, leadData, propertyData] = await Promise.all([
      RQuery(`
        SELECT
          *
        FROM
          sakani.users
        WHERE
          contactNo = '${req.body.mobileNo}';
      `),
      RQuery(`
        SELECT
          leads.*
        FROM
          leads INNER JOIN
          sakanisv2 ON leads.propertyId = sakanisv2.id
        WHERE
          sakanisv2.broker_phone = '${req.body.mobileNo}'
      `),
      RQuery(`
      SELECT
        *
      FROM
        sakanisv2
      WHERE
        broker_phone = '${req.body.mobileNo}'
      `),
    ]);
  }

  if (data.length === 0) {
    return {
      flag: false,
      message: "Data doesn't exist",
    };
  } else {
    return {
      flag: true,
      message: "Required data",
      data: propertyData,
      agentData: agentData,
      leadsData: leadData,
    };
  }
};

// To update the agent data :-
/*this code allows us to update agent information in the database, and it provides feedback on whether the update was successful or if the agent with the specified id does not exist. */
const updateAgent = async (
  id,
  firstname,
  lastname,
  BRN,
  email,
  contactNo,
  whatsapp,
  bio,
  linkedin,
  instagram,
  companyName
) => {
  const checkExistingAgent = await RQuery(`
          SELECT
              *
          FROM
              sakani.users
          WHERE
              
             id = ${id};
      `);
  if (checkExistingAgent.length === 0) {
    return {
      flag: false,
      message: `Agent with id ${id} does not exist.`,
    };
  }
  const result = WQuery(`
              UPDATE
                  users
              SET
                  firstname= '${firstname}',
                  lastname='${lastname}',
                  BRN='${BRN}',
                  email='${email}',
                  contactNo='${contactNo}',
                  whatsapp='${whatsapp}',
                  bio='${bio}',
                  linkedin='${linkedin}',
                  instagram='${instagram}',
                  companyName='${companyName}'
              WHERE
                  id = ${id};
          `);

  return {
    flag: true,
    message: result,
  };
};

// To delete the agent :-
/* this code allows us to delete an agent's information from the database based on their id, and it provides feedback on whether the deletion was successful or if the agent with the specified id does not exist. */
const deleteAgent = async (id) => {
  const checkingExistinguserId = await RQuery(`
    SELECT * FROM sakani.users WHERE id= ${id}
  `);

  if (checkingExistinguserId.length == 0) {
    return {
      flag: false,
      message: `Agent with id ${id} does not exist.`,
    };
  } else {
    const result = await WQuery(`
  DELETE FROM sakani.users WHERE id = ${id}
  `);
    return {
      flag: true,
      message: "Data deleted successfully",
      data: result,
    };
  }
};

module.exports = {
  addAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
};
