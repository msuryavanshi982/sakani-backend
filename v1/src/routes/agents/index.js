const app = require("express").Router();
const {
  addAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
} = require("../../setups/query/query.agent");

// To create agent by company name :-> This function adds a new agent with various details, ensuring data integrity and associating the agent with a specific company.
app.post("/add/:companyName", async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!req.params.companyName) {
      return res.status(404).send({
        status: false,
        message: "Company Name is required",
        path: req.path,
      });
    }

    if (!firstname) {
      return res.status(400).send({
        status: false,
        message: "firstname is required",
        path: req.path,
      });
    }
    if (!lastname) {
      return res.status(400).send({
        status: false,
        message: "lastname is required",
        path: req.path,
      });
    }
    if (!BRN) {
      return res.status(400).send({
        status: false,
        message: "BRN is required",
        path: req.path,
      });
    }
    if (!email) {
      return res.status(400).send({
        status: false,
        message: "email is required",
        path: req.path,
      });
    }
    if (!contactNo) {
      return res.status(400).send({
        status: false,
        message: "contactNo is required",
        path: req.path,
      });
    }
    if (!whatsapp) {
      return res.status(400).send({
        status: false,
        message: "whatsapp is required",
        path: req.path,
      });
    }
    if (!bio) {
      return res.status(400).send({
        status: false,
        message: "bio is required",
        path: req.path,
      });
    }
    if (!linkedin) {
      return res.status(400).send({
        status: false,
        message: "linkedin is required",
        path: req.path,
      });
    }
    if (!instagram) {
      return res.status(400).send({
        status: false,
        message: "instagram is required",
        path: req.path,
      });
    }

    const response = await addAgent(
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
      req.params.companyName
    );
    if (response.flag) {
      return res.status(201).send({
        status: true,
        message: "Agent Created Successfully",
        path: req.path,
        data: [],
      });
    } else {
      return res.status(404).send({
        status: false,
        message: "Agent Creation Failed",
        error: response.message,
        path: req.path,
        data: [],
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

// To get all agents by company name :-> This function retrieves all agents associated with a particular company, allowing for a list of agents to be displayed.
app.get("/all/:companyName/:mobile", async (req, res) => {
  try {
    const response = await getAllAgents(req.params.companyName, req.params.mobile);

    if (!req.params.companyName) {
      return res.status(404).send({
        status: false,
        message: "Company Name is required",
        path: req.path,
      });
    }
    if (response.flag) {
      return res.status(200).send({
        status: true,
        message: "ALL Agents fetched successfully",
        path: req.path,
        data: response.data,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Fetching all Agents failed",
        error: response.message,
        path: req.path,
        data: [],
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

// To get agent by agent id & company name :-> This function fetches a specific agent's details by their unique ID and company name, including agent data and associated leads.
app.post("/data/:id/:companyName", async (req, res) => {
  try {
    const response = await getAgentById(req, res);
    if (!req.params.companyName) {
      return res.status(404).send({
        status: false,
        message: "Company Name is required",
        path: req.path,
      });
    }
    if (response.flag) {
      return res.status(200).send({
        status: true,
        message: "Agent fetched successfully",
        path: req.path,
        data: response.data,
        agentData: response.agentData,
        leadsData: response.leadsData
      });
    } else {
      return res.status(404).send({
        status: false,
        message: "Fetching Agent failed",
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

// To update agent by agent id & company name :-> This function updates an existing agent's information based on their ID and company name, allowing for modifications to agent details.
app.put("/update/:id/:companyName", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      BRN,
      email,
      contactNo,
      whatsapp,
      bio,
      linkedin,
      instagram,
    } = req.body;

    if (!req.params.id) {
      return res.status(404).send({
        status: false,
        message: "agent ID is required",
        path: req.path,
      });
    }

    const response = await updateAgent(
      req.params.id,
      firstname,
      lastname,
      BRN,
      email,
      contactNo,
      whatsapp,
      bio,
      linkedin,
      instagram,
      req.params.companyName
    );
    if (response.flag) {
      return res.status(200).send({
        status: true,
        message: "Agent Updated Successfully",
        path: req.path,
        data: [],
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Agent Update Failed",
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

// To delete agent by agent id & company name :-> This function removes an agent from the system based on their unique ID and company name, effectively deleting their record.
app.delete("/delete/:id/:companyName", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(404).send({
        status: false,
        message: "Agent ID is required",
        path: req.path,
      });
    }

    if (!req.params.companyName) {
      return res.status(404).send({
        status: false,
        message: "Company name is required",
        path: req.path,
      });
    }

    const response = await deleteAgent(req.params.id);

    if (response.flag == true) {
      return res.status(200).send({
        status: true,
        message: "Agent Deleted Successfully",
        path: req.path,
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Agent Deletion Failed",
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

module.exports = app;


// SUPER-ADMIN, ADMIN, AGENT