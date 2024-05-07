/*
 importing RQuery and WQuery, from a module located at "../database/database.setup" */
const { RQuery, WQuery } = require("../database/database.setup");

// email validation : ->
const isValidEmail = function (value) {
  return /[a-zA-Z]@(pixl)\.ae\b$/g.test(value);
};

// To add subadmin :-
/*The function `addSubAdmin` checks if a user with a given email exists. If not, it adds a new sub-admin user to a system with specific details like name, email, and permissions. It returns a success message if the user is added, and it checks for email availability and validity. */
const addSubAdmin = async (
  password,
  firstname,
  lastname,
  email,
  contactNo,
  isAdmin,
  role,
  addRule,
  editRule,
  viewRule,
  image,
  companyName
) => {
  const checkExistingAdmin = await RQuery(`
        SELECT
            *
        FROM
            users
        WHERE email = '${email}';
    `);

  if (!email)
    return {
      flag: false,
      message: "Email is required",
    };

  // if (!isValidEmail(email.trim()))
  //   return {
  //     flag: false,
  //     message: "Email is not valid. Email only can be created with @pixl.ae domain",
  //   };

  if (checkExistingAdmin.length > 0) {
    return {
      flag: false,
      message: " Email Already Exists",
    };
  } else {
    const result = WQuery(`
            INSERT INTO
                users
            (  
                username,
                password,
                firstname,
                lastname,
                email,              
                companyName,
                contactNo,
                createdAt,
                updatedAt,
                isAdmin,
                role,
                addRule,
                editRule,
                viewRule,
                image
            ) VALUES (
                '${email.split("@")[0]}',
                '${password}',
                '${firstname}',
                '${lastname}',
                '${email}',
                '${companyName}',
                '${contactNo}',
                NOW(),
                NOW(),
                '${isAdmin}',
                '${role}',
                '${addRule}',
                '${editRule}',
                '${viewRule}',
                null
            );
        `);

    return {
      flag: true,
      message: result,
    };
  }
};

// To get subadmin information :-
/*
The function getAllSubAdmins retrieves a list of sub-admin users based on the mobile number provided. If the user has a "Super Admin" role, it fetches all admin and sub-admin users' details. Otherwise, for "Admin" and "Sub Admin" roles, it fetches users' details from the same company as the logged-in user. */
const getAllSubAdmins = async (mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  subAdmins = [];
  if (userData[0].role == "Super Admin") {
    subAdmins = await RQuery(`
      SELECT
        id,
        username,
        password,
        concat(firstname,' ', ifnull(lastname,'') ) as fullname,
        firstname,
        lastname,
        email,
        companyName,
        contactNo,
        createdAt,
        updatedAt,
        isAdmin,
        role,
        addRule,
        editRule,
        viewRule
      FROM
          sakani.users  
      WHERE 
        role in ('Admin', 'Sub Admin');
    `);
  } else {
    subAdmins = await RQuery(`
      SELECT
        id,
        username,
        password,
        concat(firstname,' ', ifnull(lastname,'') ) as fullname,
        firstname,
        lastname,
        email,
        companyName,
        contactNo,
        createdAt,
        updatedAt,
        isAdmin,
        role,
        addRule,
        editRule,
        viewRule
      FROM
          sakani.users  
      WHERE 
        role in ('Admin', 'Sub Admin') 
        and companyName = '${userData[0].companyName}'
`);
  }

  if (subAdmins.length === 0) {
    return {
      flag: false,
      message: "Data doesn't exist",
    };
  } else {
    return {
      flag: true,
      message: "Required data",
      data: subAdmins,
    };
  }
};

// To update subadmin information by id :-
/*
The updateSubAdminById function is used to update the details of a sub-admin user by their ID. It first checks if the user with the specified ID exists. If the user exists, it updates their information */
const updateSubAdminById = async (
  id,
  firstname,
  lastname,
  email,
  contactNo,
  isAdmin,
  role,
  addRule,
  editRule,
  viewRule,
  image,
  companyName
) => {
  const checkExistingAdmin = await RQuery(`
    SELECT * FROM sakani.users WHERE id = ${id};
  `);

  if (checkExistingAdmin.length > 0) {
    const result = await WQuery(`
      UPDATE users SET
        firstname = '${firstname}',
        lastname = '${lastname}',
        email = '${email}',
        companyName = '${companyName}',
        contactNo = '${contactNo}',
        updatedAt = NOW(),
        isAdmin = '${isAdmin}',
        role = '${role}',
        addRule = '${addRule}',
        editRule = '${editRule}',
        viewRule = '${viewRule}',
        image = null
      WHERE id = ${id};
    `);

    return {
      flag: true,
      message: result,
    };
  } else {
    return {
      flag: false,
      message: "Sub Admin ID not found",
    };
  }
};

// To delete subadmin by subadmin ID :-
/*
The deleteSubAdminById function is used to delete a sub-admin user by their ID. It first checks if the user with the specified ID exists */
const deleteSubAdminById = async (id) => {
  const checkExistingAdmin = await RQuery(`
    SELECT * FROM sakani.users WHERE id = ${id};
  `);

  if (checkExistingAdmin.length > 0) {
    const result = await WQuery(`
      DELETE FROM users WHERE id = ${id};
    `);

    return {
      flag: true,
      message: result,
    };
  } else {
    return {
      flag: false,
      message: "Sub Admin ID not found",
    };
  }
};

//exporting all the above functions
module.exports = {
  addSubAdmin,
  getAllSubAdmins,
  updateSubAdminById,
  deleteSubAdminById,
};
