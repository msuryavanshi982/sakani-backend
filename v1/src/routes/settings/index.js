const app = require("express").Router();
const {
  addSubAdmin,
  getAllSubAdmins,
  updateSubAdminById,
  deleteSubAdminById,
} = require("../../setups/query/query.settings");

// To create sub-admins by company name :->
app.post("/sub-admin/add/:companyName", async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!req.params.companyName) {
      return res.send({
        statusCode: 400,
        message: "Company Name is required",
      });
    }

    if (!password) {
      return res.send({
        statusCode: 400,
        message: "password is required",
      });
    }

    if (!firstname) {
      return res.send({
        statusCode: 400,
        message: "firstname is required",
      });
    }

    if (!lastname) {
      return res.send({
        statusCode: 400,
        message: "lastname is required",
      });
    }

    if (!email) {
      return res.send({
        statusCode: 404,
        message: "email is required",
      });
    }

    if (!contactNo) {
      return res.send({
        statusCode: 400,
        message: "contactNo is required",
      });
    }

    if (isAdmin == undefined || isAdmin == null) {
      return res.send({
        statusCode: 400,
        message: "isAdmin is required",
      });
    }

    if (!role) {
      return res.send({
        statusCode: 400,
        message: "role is required",
      });
    }

    if (addRule == undefined || addRule == null) {
      return res.send({
        statusCode: 400,
        message: "addRule is required",
      });
    }

    if (editRule == undefined || editRule == null) {
      return res.send({
        statusCode: 400,
        message: "editRule is required",
      });
    }

    if (viewRule == undefined || viewRule == null) {
      return res.send({
        statusCode: 400,
        message: "viewRule is required",
      });
    }

    if (!image) {
      return res.send({
        statusCode: 400,
        message: "image is required",
      });
    }

    const response = await addSubAdmin(
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
      req.params.companyName
    );
   
    if (response.flag) {
      return res.send({
        statusCode: 201,
        message: "Sub Admin Created Successfully",
        path: req.path,
        data: [],
      });
    } else {
      return res.send({
        statusCode: 400,
        message: "Sub Admin Creation Failed",
        error: response.message,
        path: req.path,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      error: err.message,
      path: req.path,
    });
  }
});

// To fetch all sub-admins by company name :->
app.get("/sub-admin/all/:companyName/:mobile", async (req, res) => {
  try {
    const response = await getAllSubAdmins(req.params.mobile);
    if (response.flag) {
      return res.send({
        statusCode: 200,
        message: "ALL subadmins fetched successfully",
        path: req.path,
        data: response.data,
      });
    } else {
      return res.send({
        statusCode: 200,
        message: "Fetching all subadmins failed",
        error: response.message,
        path: req.path,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      error: err.message,
      path: req.path,
    });
  }
});

// To update all sub-admin by id & company name :->
app.put("/sub-admin/update/:id/:companyName", async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!req.params.id) {
      return res.send({
        statusCode: 405,
        message: "Sub Admin ID is required",
        path: req.path,
      });
    }

    const response = await updateSubAdminById(
      req.params.id,
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
      req.params.companyName
    );
    if (response.flag) {
      return res.send({
        statusCode: 200,
        message: "Sub Admin Updated Successfully",
        path: req.path,
        data: [],
      });
    } else {
      return res.send({
        statusCode: 200,
        message: "Sub Admin Update Failed",
        error: response.message,
        path: req.path,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false,
      error: err.message,
      path: req.path,
    });
  }
});

// To delete sub-admin by id & company name :->
app.delete("/sub-admin/delete/:id/:companyName", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.send({
        statusCode: 405,
        message: "Sub Admin ID is required",
        path: req.path,
      });
    }

    const response = await deleteSubAdminById(req.params.id);
    if (response.flag === false) {
      return res.send({
        statusCode: 400,
        message: "Sub Admin Deletion failed",
        path: req.path,
      });
    }
    return res.send({
      statusCode: 200,
      message: "Sub Admin Deleted successfully",
      path: req.path,
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

module.exports = app;
