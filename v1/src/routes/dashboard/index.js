const app = require("express").Router();
const {
  totalListings,
  countImpressions,
  countClicks,
  topCommunityBySale,
  topCommunityByRent,
  byRentGraph,
  bySaleGraph,
} = require("../../setups/query/query.dashboard");

// To count totalListings:-
/*this route calculates and provides data related to total listings based on the dates and mobile number provided in the request body. */
app.post("/totallistings", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await totalListings(previousDate, currentDate, mobile);
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To count impressions:-
/*this route calculates and provides data related to impressions based on the dates and mobile number provided in the request body. */
app.post("/impresssions", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await countImpressions(
      previousDate,
      currentDate,
      mobile
    );
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To count clicks:-
/* this route calculates and provides data related to the number of clicks based on the dates and mobile number provided in the request body. */
app.post("/clicks", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterDAta = await countClicks(previousDate, currentDate, mobile);
    return res.status(200).send({ status: true, data: filterDAta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To get topCommunityBySale:-
/* this route calculates and provides data related to the top community by sales based on the dates and mobile number provided in the request body. */
app.post("/topcommunitybysale", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await topCommunityBySale(
      previousDate,
      currentDate,
      mobile
    );
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To get topCommunityByRent:-
/*this route calculates and provides data related to the top community by rental activity based on the dates and mobile number provided in the request body. */
app.post("/topcommunitybyRent", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await topCommunityByRent(
      previousDate,
      currentDate,
      mobile
    );
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To get graph by rent:-
/*this route calculates and provides data related to rental activity in graphical format based on the dates and mobile number provided in the request body. */
app.post("/byRentGraph", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await byRentGraph(previousDate, currentDate, mobile);
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// To get graph by Sale:-
/*this route is responsible for generating and providing data related to sales activity in graphical form based on the specified dates and mobile number in the request body. */
app.post("/bySaleGraph", async (req, res) => {
  try {
    let { currentDate, previousDate, mobile } = req.body;

    const filterData = await bySaleGraph(previousDate, currentDate, mobile);
    return res.status(200).send({ status: true, data: filterData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = app;
