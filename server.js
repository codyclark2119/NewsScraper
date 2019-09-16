const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
// Require all models
const db = require("./models");
// Our scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// Initialize Express
const app = express();
let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 8000;
}

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraperhw", {
  useNewUrlParser: true
});

// Routes
// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.foxnews.com/politics").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    let $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("p.dek").each(function (i, element) {
      // Save an empty result object
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
      if ((result.link).startsWith("/")) {
        let foxlink = "https://www.foxnews.com";
        result.link = foxlink + result.link;
      }
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {})
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    console.log("Fox complete!");
    secondScrape();
  });

  const secondScrape = function () {
    axios.get("https://www.msnbc.com/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("h2.title___2T5qK").each(function (i, element) {
        // Save an empty result object
        let result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {})
          .catch(function (err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
      // If we were able to successfully scrape and save an Article, send a message to the client
      console.log("MSNBC Complete");
      thirdScrape();
    });
  };

  const thirdScrape = function () {
    axios.get("https://www.breitbart.com/politics/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("div.grp-content h2").each(function (i, element) {
        // Save an empty result object
        let result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {})
          .catch(function (err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
      });
      // If we were able to successfully scrape and save an Article, send a message to the client
      console.log("Breitbart Complete");
      fourthScrape();

    });
  };

  const fourthScrape = function () {
    axios.get("https://www.democracynow.org/").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      let $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $("div.content h3").each(function (i, element) {
        // Save an empty result object
        let result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        if ((result.link).startsWith("/")) {
          let demlink = "https://www.democracynow.org";
          result.link = demlink + result.link;
        }

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function (dbArticle) {})
          .catch(function (err) {
            return res.json(err);
          });
      });
      // If we were able to successfully scrape and save an Article, send a message to the client
      console.log("Democracy Now! Complete");
      return res.redirect("/");
    });
  };
});


// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({
      _id: req.params.id
    })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      console.log(dbArticle);
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      console.log(dbNote);
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      }).populate("note");
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});



// Start the server
app.listen(PORT, function () {
  console.log(`App running on http://localhost:${PORT}`);
});