/*
 importing RQuery and WQuery, from a module located at "../database/database.setup"
*/
const { RQuery } = require("../database/database.setup");

/*this function calculates the total number of property listings based on the user's role and mobile number and returns the result. */
const totalListings = async (previousDate, currentDate, mobile) => {
  try {
    const userData = await RQuery(
      `select * from users where contactNo = '${mobile}';`
    );
    var totalListings = [];
    if (userData[0].role == "Super Admin") {
      totalListings = await RQuery(`
        SELECT 
          count(*) as totalListing 
        FROM 
          sakanisv2 ;
      `);
    } else if (userData[0].role == "Admin" || userData[0].role == "Sub Admin") {
      totalListings = await RQuery(`
        SELECT 
          count(*) as totalListing 
        FROM 
          sakanisv2 
        WHERE 
          broker_company_name = '${userData[0].companyName}';
      `);
    } else {
      totalListings = await RQuery(`
      SELECT 
        count(*) as totalListing 
      FROM 
        sakanisv2 
      WHERE 
        broker_phone = '${userData[0].contactNo}'
      `);
    }

    return totalListings[0].totalListing || 0;
  } catch (error) {}
};

/*this function calculates and returns the total number of impressions based on the user's role and the date range provided. */
const countImpressions = async (previousDate, currentDate, mobile) => {
  try {
    const userData = await RQuery(
      `select * from users where contactNo = '${mobile}';`
    );

    if (userData[0].role === "Admin") {
      let allProperties = await performAggregation("sakanis", [
        {
          $match: {
            broker_company_name: userData[0].companyName,
          },
        },
        {
          $project: {
            id: 1,
            _id: 0,
          },
        },
        {
          $group: {
            _id: null,
            ids: { $push: "$id" },
          },
        },
        {
          $project: {
            _id: 0,
            ids: 1,
          },
        },
      ]);
      let data = await performAggregation("leads", [
        {
          $match: {
            createdAt: {
              $lt: new Date(currentDate),
              $gte: new Date(previousDate),
            },
            propertyId: { $in: allProperties[0].ids },
            event_type: "impression",
          },
        },
        {
          $group: {
            _id: "$propertyId",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            distinctCount: { $sum: 1 },
          },
        },
      ]);
      return data;
    } else {
      let data = await performAggregation("leads", [
        {
          $match: {
            broker_phone: mobile,
            createdAt: {
              $lt: new Date(currentDate),
              $gte: new Date(previousDate),
            },
            event_type: "impression",
          },
        },
        {
          $group: {
            _id: "$propertyId",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            distinctCount: { $sum: 1 },
          },
        },
      ]);
      return data;
    }
  } catch (error) {}
};

/*this function calculates and returns the total number of clicks based on the user's role and the date range provided. */
const countClicks = async (previousDate, currentDate, mobile) => {
  try {
    const userData = await RQuery(
      `select * from users where contactNo = '${mobile}';`
    );

    if (userData[0].role === "Admin") {
      let allProperties = await performAggregation("sakanis", [
        {
          $match: {
            broker_company_name: userData[0].companyName,
          },
        },
        {
          $project: {
            id: 1,
            _id: 0,
          },
        },
        {
          $group: {
            _id: null,
            ids: { $push: "$id" },
          },
        },
        {
          $project: {
            _id: 0,
            ids: 1,
          },
        },
      ]);
      let data = await performAggregation("leads", [
        {
          $match: {
            createdAt: {
              $lt: new Date(currentDate),
              $gte: new Date(previousDate),
            },
            propertyId: { $in: allProperties[0].ids },
            event_type: "click",
          },
        },
        {
          $group: {
            _id: "$propertyId",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            distinctCount: { $sum: 1 },
          },
        },
      ]);
      return data;
    } else {
      let data = await performAggregation("leads", [
        {
          $match: {
            broker_phone: mobile,
            createdAt: {
              $lt: new Date(currentDate),
              $gte: new Date(previousDate),
            },
            event_type: "click",
          },
        },
        {
          $group: {
            _id: "$propertyId",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            distinctCount: { $sum: 1 },
          },
        },
      ]);
      return data;
    }
  } catch (error) {}
};

/*this function helps identify and rank communities with the highest sales activity within a specified date range, tailored to the user's role and company affiliation.*/
const topCommunityBySale = async (previousDate, currentDate, mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  var saleData = [];
  if (userData[0].role == "Super Admin") {
    saleData = await RQuery(`
        SELECT
            community,
            short_description as building_name,
            property_type,
            leadCount,
            @rowNumber := @rowNumber + 1 AS ranking
        FROM
            (
                SELECT
                    community,
                    short_description,
                    property_type,
                    sum(X.ids) AS leadCount
                FROM
                    sakanisv2 AS sk
                    INNER JOIN (
                        SELECT
                            count(*) AS ids,
                            propertyId
                        FROM
                            leads
                            INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                        WHERE
                            sakanisv2.purpose_1 = 'buy'
                            AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                        GROUP BY
                            propertyId
                    ) X ON sk.id = X.propertyId
                WHERE
                    sk.purpose_1 = 'buy'
                GROUP BY
                    community,
                    short_description,
                    property_type
            ) AS leadCounts
            CROSS JOIN (SELECT @rowNumber := 0) AS r
        ORDER BY
            leadCount DESC;
        `);
  } else if (userData[0].role == "Sub Admin" || userData[0].role == "Admin") {
    saleData = await RQuery(`
        SELECT
            community,
            short_description as building_name,
            property_type,
            leadCount,
            @rowNumber := @rowNumber + 1 AS ranking
        FROM
            (
                SELECT
                    community,
                    short_description,
                    property_type,
                    sum(X.ids) AS leadCount
                FROM
                    sakanisv2 AS sk
                    INNER JOIN (
                        SELECT
                            count(*) AS ids,
                            propertyId
                        FROM
                            leads
                            INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                        WHERE
                            sakanisv2.broker_company_name = '${userData[0].companyName}'
                            AND sakanisv2.purpose_1 = 'buy'
                            AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                        GROUP BY
                            propertyId
                    ) X ON sk.id = X.propertyId
                WHERE
                    sk.broker_company_name = '${userData[0].companyName}'
                    AND sk.purpose_1 = 'buy'
                GROUP BY
                    community,
                    short_description,
                    property_type
            ) AS leadCounts
            CROSS JOIN (SELECT @rowNumber := 0) AS r
        ORDER BY
            leadCount DESC;
        `);
  } else {
    saleData = await RQuery(`
        SELECT
            community,
            short_description,
            property_type,
            leadCount,
            @rowNumber := @rowNumber + 1 AS rowNumber
        FROM
            (
                SELECT
                    community,
                    short_description,
                    property_type,
                    sum(X.ids) AS leadCount
                FROM
                    sakanisv2 AS sk
                    INNER JOIN (
                        SELECT
                            count(*) AS ids,
                            propertyId
                        FROM
                            leads
                            INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                        WHERE
                            sakanisv2.broker_phone = '${userData[0].contactNo}'
                            AND sakanisv2.purpose_1 = 'buy'
                            AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                        GROUP BY
                            propertyId
                    ) X ON sk.id = X.propertyId
                WHERE
                    sk.broker_phone = '${userData[0].contactNo}'
                    AND sk.purpose_1 = 'buy'
                GROUP BY
                    community,
                    short_description,
                    property_type
            ) AS leadCounts
            CROSS JOIN (SELECT @rowNumber := 0) AS r
        ORDER BY
            leadCount DESC;
`);
  }
  return saleData;
};

/*this function this code helps identify and rank communities with the highest rental activity within a specified date range, tailored to the user's role and company affiliation. */
const topCommunityByRent = async (previousDate, currentDate, mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  var saleData = [];
  if (userData[0].role == "Super Admin") {
    saleData = await RQuery(`
      SELECT
          community,
          short_description as building_name,
          property_type,
          leadCount,
          @rowNumber := @rowNumber + 1 AS ranking
      FROM
          (
              SELECT
                  community,
                  short_description,
                  property_type,
                  sum(X.ids) AS leadCount
              FROM
                  sakanisv2 AS sk
                  INNER JOIN (
                      SELECT
                          count(*) AS ids,
                          propertyId
                      FROM
                          leads
                          INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                      WHERE
                          sakanisv2.purpose_1 = 'rent'
                          AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                      GROUP BY
                          propertyId
                  ) X ON sk.id = X.propertyId
              WHERE
                  sk.purpose_1 = 'rent'
              GROUP BY
                  community,
                  short_description,
                  property_type
          ) AS leadCounts
          CROSS JOIN (SELECT @rowNumber := 0) AS r
      ORDER BY
          leadCount DESC;
      `);
  } else if ((userData[0].role = "Sub Admin" || userData[0].role == "Admin")) {
    saleData = await RQuery(`
      SELECT
          community,
          short_description as building_name,
          property_type,
          leadCount,
          @rowNumber := @rowNumber + 1 AS ranking
      FROM
          (
              SELECT
                  community,
                  short_description,
                  property_type,
                  sum(X.ids) AS leadCount
              FROM
                  sakanisv2 AS sk
                  INNER JOIN (
                      SELECT
                          count(*) AS ids,
                          propertyId
                      FROM
                          leads
                          INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                      WHERE
                          sakanisv2.broker_company_name = '${userData[0].companyName}'
                          AND sakanisv2.purpose_1 = 'rent'
                          AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                      GROUP BY
                          propertyId
                  ) X ON sk.id = X.propertyId
              WHERE
                  sk.broker_company_name = '${userData[0].companyName}'
                  AND sk.purpose_1 = 'rent'
              GROUP BY
                  community,
                  short_description,
                  property_type
          ) AS leadCounts
          CROSS JOIN (SELECT @rowNumber := 0) AS r
      ORDER BY
          leadCount DESC;
      `);
  } else {
    saleData = await RQuery(`
      SELECT
          community,
          short_description,
          property_type,
          leadCount,
          @rowNumber := @rowNumber + 1 AS rowNumber
      FROM
          (
              SELECT
                  community,
                  short_description,
                  property_type,
                  sum(X.ids) AS leadCount
              FROM
                  sakanisv2 AS sk
                  INNER JOIN (
                      SELECT
                          count(*) AS ids,
                          propertyId
                      FROM
                          leads
                          INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                      WHERE
                          sakanisv2.broker_phone = '${userData[0].contactNo}'
                          AND sakanisv2.purpose_1 = 'rent'
                          AND (date(leads.createdAt) BETWEEN date('${previousDate}') AND date('${currentDate}'))
                      GROUP BY
                          propertyId
                  ) X ON sk.id = X.propertyId
              WHERE
                  sk.broker_phone = '${userData[0].contactNo}'
                  AND sk.purpose_1 = 'rent'
              GROUP BY
                  community,
                  short_description,
                  property_type
          ) AS leadCounts
          CROSS JOIN (SELECT @rowNumber := 0) AS r
      ORDER BY
          leadCount DESC;
`);
  }
  return saleData;
};

/*this function helps analyze and visualize lead generation patterns for rental properties, categorized by communication mode and hour of the day, tailored to the user's role and company affiliation. */
const byRentGraph = async (previousDate, currentDate, mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  var saleData = [];
  var [email, chat, call, total] = [0, 0, 0, 0];
  if (userData[0].role == "Super Admin") {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.purpose_1 = 'rent'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.purpose_1 = 'rent'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc   
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  } else if (userData[0].role == "Sub Admin" || userData[0].role == "Admin") {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                        AND sakanisv2.purpose_1 = 'rent'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                      AND sakanisv2.purpose_1 = 'rent'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                    AND sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.broker_company_name = '${userData[0].companyName}'
                    AND sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc   
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  } else {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                        AND sakanisv2.purpose_1 = 'rent'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                      AND sakanisv2.purpose_1 = 'rent'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                    AND sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.broker_phone = '${userData[0].contactNo}'
                    AND sakanisv2.purpose_1 = 'rent'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  }

  return {
    email: {
      count: JSON.parse(email[0].count) || [],
      hour: JSON.parse(email[0].hour) || [],
    },
    chat: {
      count: JSON.parse(chat[0].count) || [],
      hour: JSON.parse(chat[0].hour) || [],
    },
    call: {
      count: JSON.parse(call[0].count) || [],
      hour: JSON.parse(call[0].hour) || [],
    },
    total: {
      count: JSON.parse(total[0].count) || [],
      hour: JSON.parse(total[0].hour) || [],
    },
  };
};

/*this function is structured similarly to the byRentGraph function but focuses on lead generation patterns for sales of properties instead of rentals. */
const bySaleGraph = async (previousDate, currentDate, mobile) => {
  const userData = await RQuery(
    `select * from users where contactNo = '${mobile}';`
  );
  var saleData = [];
  var [email, chat, call, total] = [0, 0, 0, 0];
  if (userData[0].role == "Super Admin") {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.purpose_1 = 'buy'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.purpose_1 = 'buy'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  } else if (userData[0].role == "Sub Admin" || userData[0].role == "Admin") {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                        AND sakanisv2.purpose_1 = 'buy'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                      AND sakanisv2.purpose_1 = 'buy'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.broker_company_name = '${userData[0].companyName}'
                    AND sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.broker_company_name = '${userData[0].companyName}'
                    AND sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  } else {
    [email, chat, call, total] = await Promise.all([
      RQuery(`
        SELECT
          JSON_ARRAYAGG(count_id) AS count,
          JSON_ARRAYAGG(hour_am_pm) AS hour
          FROM (
            SELECT
              count(id) as count_id,
              hour_am_pm
            FROM
                (
                    SELECT
                        leads.id,
                        DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                    FROM
                        leads
                        INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                    WHERE
                        communication_mode = 'email'
                        AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                        AND sakanisv2.purpose_1 = 'buy'
                        AND (
                            date(leads.createdAt) BETWEEN date('${previousDate}')
                            AND date('${currentDate}')
                        )
                    ORDER BY
                        leads.createdAt asc
                ) AS subquery
            GROUP BY
                hour_am_pm
            ORDER BY
                STR_TO_DATE(
                    CONCAT(
                        SUBSTRING(hour_am_pm, 1, 2),
                        ' ',
                        SUBSTRING(hour_am_pm, -2)
                    ),
                    '%h %p'
                ) ASC) agg;
      `),
      RQuery(`
      SELECT
        JSON_ARRAYAGG(count_id) AS count,
        JSON_ARRAYAGG(hour_am_pm) AS hour
        FROM (
          SELECT
            count(id) as count_id,
            hour_am_pm
          FROM
              (
                  SELECT
                      leads.id,
                      DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                  FROM
                      leads
                      INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                  WHERE
                      communication_mode = 'chat'
                      AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                      AND sakanisv2.purpose_1 = 'buy'
                      AND (
                          date(leads.createdAt) BETWEEN date('${previousDate}')
                          AND date('${currentDate}')
                      )
                  ORDER BY
                      leads.createdAt asc
              ) AS subquery
          GROUP BY
              hour_am_pm
          ORDER BY
              STR_TO_DATE(
                  CONCAT(
                      SUBSTRING(hour_am_pm, 1, 2),
                      ' ',
                      SUBSTRING(hour_am_pm, -2)
                  ),
                  '%h %p'
              ) ASC) agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    communication_mode = 'call'
                    AND sakanisv2.broker_phone = '${userData[0].contactNo}'
                    AND sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
      RQuery(`
      SELECT
      JSON_ARRAYAGG(count_id) AS count,
      JSON_ARRAYAGG(hour_am_pm) AS hour
      FROM (
        SELECT
          count(id) as count_id,
            hour_am_pm
        FROM
            (
                SELECT
                    leads.id,
                    DATE_FORMAT(leads.createdAt, '%h %p') AS hour_am_pm
                FROM
                    leads
                    INNER JOIN sakanisv2 ON propertyId = sakanisv2.id
                WHERE
                    sakanisv2.broker_phone = '${userData[0].contactNo}'
                    AND sakanisv2.purpose_1 = 'buy'
                    AND (
                        date(leads.createdAt) BETWEEN date('${previousDate}')
                        AND date('${currentDate}')
                    )
                ORDER BY
                    leads.createdAt asc
            ) AS subquery
        GROUP BY
            hour_am_pm
        ORDER BY
            STR_TO_DATE(
                CONCAT(
                    SUBSTRING(hour_am_pm, 1, 2),
                    ' ',
                    SUBSTRING(hour_am_pm, -2)
                ),
                '%h %p'
            ) ASC)agg;
      `),
    ]);
  }

  return {
    email: {
      count: JSON.parse(email[0].count) || [],
      hour: JSON.parse(email[0].hour) || [],
    },
    chat: {
      count: JSON.parse(chat[0].count) || [],
      hour: JSON.parse(chat[0].hour) || [],
    },
    call: {
      count: JSON.parse(call[0].count) || [],
      hour: JSON.parse(call[0].hour) || [],
    },
    total: {
      count: JSON.parse(total[0].count) || [],
      hour: JSON.parse(total[0].hour) || [],
    },
  };
};

// exporting functions
module.exports = {
  totalListings,
  countImpressions,
  countClicks,
  topCommunityBySale,
  topCommunityByRent,
  byRentGraph,
  bySaleGraph,
};
