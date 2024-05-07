/*
 importing RQuery and WQuery, from a module located at "../database/database.setup" 
*/
const { RQuery, WQuery } = require("../database/database.setup");

// updateProfile :- 
/* this function is used to update a user's profile information in the database, but it first checks if the user with the specified id exists before performing the update. */
const updateProfile = async (id, userName, companyName, email, contactNo) => {
  const checkExistingUser = await RQuery(`
            SELECT
                *
            FROM
                sakani.users
            WHERE
                
               id = ${id};
        `);
  if (checkExistingUser.length === 0) {
    return {
      flag: false,
      message: `User with id ${id} does not exist.`,
    };
  }
  const result = WQuery(`
                UPDATE
                    users
                SET
                    username= '${userName}',
                    companyName='${companyName}',
                    email='${email}',
                    contactNo='${contactNo}'                   
                WHERE
                    id = ${id};
            `);

  return {
    flag: true,
    message: result,
  };
};

// updatePassword :-
/* this function is used to update a user's password in the database, but it first checks if the user with the specified id exists before performing the update. */
const updatePassword = async (id, password) => {
  const checkExistingUser = await RQuery(`
            SELECT
                *
            FROM
                sakani.users
            WHERE
               id = ${id};
        `);
  if (checkExistingUser.length === 0) {
    return {
      flag: false,
      message: `User with id ${id} does not exist.`,
    };
  }
  const result = WQuery(`
                UPDATE
                    users
                SET
                    password= '${password}'          
                WHERE
                    id = ${id};
            `);

  return {
    flag: true,
    message: result,
  };
};

module.exports = {
  updateProfile,
  updatePassword,
};
