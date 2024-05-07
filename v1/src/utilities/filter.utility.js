const filter = async (req, page) => {
  const { dateFilterType, date, filterDateFrom, filterDateTo, shift, camera } =
    req.body;

  var textCreation = "";

  if (page == "dashboard") {
    if (dateFilterType == "single") {
      textCreation += `date = '${date}' `;
    } else if (dateFilterType == "range") {
      textCreation += `(date BETWEEN '${filterDateFrom}' AND '${filterDateTo}') `;
    } else {
      textCreation += "date >= subdate(curdate(), 7) ";
    }
  } else {
    if (dateFilterType == "single") {
      textCreation += `date = '${date}' `;
    } else if (dateFilterType == "range") {
      textCreation += `(date BETWEEN '${filterDateFrom}' AND '${filterDateTo}') `;
    } else {
      textCreation += "date = curdate() ";
    }

    if (camera.length != 0) {
      textCreation +=
        " AND areaCamera in (" + camera.map((c) => `'${c}'`).join(", ") + ") ";
    } else {
      textCreation += " ";
    }
  }

  if (shift.length != 0) {
    textCreation +=
      " AND shift in (" + shift.map((c) => `'${c}'`).join(", ") + ")";
  } else {
    textCreation += " AND shift in ('A', 'B', 'C')";
  }

  return textCreation;
};

module.exports = filter;
