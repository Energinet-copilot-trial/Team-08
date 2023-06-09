// get an ordered list of incidents from database.csv sorted by fatalities

// read in the csv file
var csv = require("csv");
var fs = require("fs");

// start an express server
var express = require("express");

// read the csv file
var data = fs.readFileSync("database.csv", "utf8");

// parse the csv file
csv.parse(data, function (err, data) {
  // summarize number of Fatalities per Species
  var species = {};
  data.forEach(function (row) {
    var speciesName = row[31];
    var fatalities = parseInt(row[35]);
    fatalities = isNaN(fatalities) ? 0 : fatalities;
    if (speciesName in species) {
      species[speciesName] += fatalities;
    } else {
      species[speciesName] = fatalities;
    }
  });

  // sort species object by fatalities
  var sortable = [];
  for (var speciesName in species) {
    sortable.push([speciesName, species[speciesName]]);
    sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
  }
  console.log(sortable);

  // summarize how many incidents per species
  var species = {};
  data.forEach(function (row) {
    var speciesName = row[31];
    if (speciesName in species) {
      species[speciesName] += 1;
    } else {
      species[speciesName] = 1;
    }
  });

  // sort species object by fatalities
  var sortable = [];
  for (var speciesName in species) {
    sortable.push([speciesName, species[speciesName]]);
    sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
  }
  console.log(sortable);

  // get average altitude of incidents for Canada Goose
  var canadaGooseAltitude = [];
  data.forEach(function (row) {
    var speciesName = row[31];
    var altitude = parseInt(row[27]);
    if (speciesName === "CANADA GOOSE") {
      canadaGooseAltitude.push(altitude);
    }
  });

  // remove 0 values and invalid numbers from canadaGooseAltitude
  canadaGooseAltitude = canadaGooseAltitude.filter(function (altitude) {
    return altitude > 0;
  });

  // get the lowest value in canadaGooseAltitude
  var min = canadaGooseAltitude.reduce(function (a, b) {
    return Math.min(a, b);
  });

  // get the highest value in canadaGooseAltitude
  var max = canadaGooseAltitude.reduce(function (a, b) {
    return Math.max(a, b);
  });

  console.log(min, max);

  // get the average altitude
  var sum = canadaGooseAltitude.reduce(function (a, b) {
    return a + b;
  }, 0);

  sum = sum / canadaGooseAltitude.length;

  console.log(sum);
});

// start an express server
var app = express();

// serve static files from the public directory
app.use(express.static("public"));

// start the server on port 3000
app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});

// alert endpoint
app.get("/alert", function (request, response) {
  var url =
    "https://flight-radar1.p.rapidapi.com/flights/list-in-boundary?bl_lat=-50&bl_lng=-150&tr_lat=60&tr_lng=-20&limit=300&altitude=1%2C13000";

  var options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "1593aa5d52mshaccb1f298cf9d5ap16d9a1jsne2852856a241",
      "X-RapidAPI-Host": "flight-radar1.p.rapidapi.com",
    },
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((flights) => {
      // get an array of aircrafts
      var aircrafts = flights.aircraft;

      // sort aircrafts by altitude closes to 1115
      aircrafts.sort(function (a, b) {
        return Math.abs(a[5] - 1115) - Math.abs(b[5] - 1115);
      });

      // get the first 3 aircrafts
      aircrafts = aircrafts.slice(0, 5);

      // return json response
      response.json(aircrafts);
    });
});
