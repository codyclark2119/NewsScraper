// Grab the articles as a json
$.getJSON("/articles", function (data) {
  console.log(data);
  function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  shuffle(data);
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<br><div id='news' data-id='" + data[i]._id + "'><p>" + data[i].title + "</p><a target='_blank' href='" + data[i].link + "'>NEWS LINK</a></div><br>");
  }
  $("#notes").hide();
  $("#comments").hide();
});

// Whenever someone clicks a p tag
$(document).on("click", "#news", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  $("#notes").show();
  $("#comments").empty();
  $("#comments").show();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article

      $("#notes").append("<h2 class='notetitle'>" + data.title + "</h2>");

      // If there's a note in the article
      if (data.note) {
        // Place the value of the note in the user input
        $("#notes").append("<div class='container' id='userComment'><h6><i>Last Comment:</i></h6><h4>" + data.note.user + "</h4><div>");
        // Place the body of the note in the body textarea
        $("#userComment").append("<h3 class='userComment text-left'><strong>" + data.note.body + "</strong></h3><br>");
      }
      // An input to enter a new user
      $("#notes").append("<br><input id='userinput' name='user' placeholder='Username' ><br>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Comment'></textarea><br>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' class='btn btn-success' id='savenote'>Save Note</button><br>");


    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from user input
      user: $("#userinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
      $("#notes").hide();
      $("#comments").empty();
      $("#comments").hide();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#userinput").val("");
  $("#bodyinput").val("");
});
