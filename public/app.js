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
    $("#articles").append(`<div id='${data[i]._id}' class='container col-lg-12 m-1 news'><h3 class='p-2'>${data[i].title}</h3><button class='m-2 btn btn-primary' target='_blank' href='${data[i].link}'>Read it here!</button><div class='m-2 btn btn-secondary commentBtn' data-id='${data[i]._id}'>Comment</div></div><br>`);
    $(".notes").hide();
  }

});



// Whenever someone clicks a p tag
$(document).on("click", ".commentBtn", function () {
  // Empty the notes from the note section
  $(".notes").hide();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  }).then(function (data) {
    data = JSON.parse(JSON.stringify(data));
    $('#' + thisId).append(`<div class='notes row m-1 mt-1 container-fluid'></div>`);
    // If there's a note in the article
    $(".notes").append(`<div class='container input-group col-5'></div>`);
    $(".input-group").append(`<input type='text' id='userinput' name='user' placeholder='Username'></input><br><textarea id='bodyinput' name='body' placeholder='Comment'></textarea>`)
    $(".input-group").append(`<br><button data-id='${thisId}' class='btn btn-success' id='savenote'>Save Note</button>`);
    if (data.note) {
      console.log(data.note);
      // Place the value of the note in the user input
      $(".notes").append(`<div class='container col-5 mx-auto' id='userComment'><h6><i>Last Comment:</i></h6><h3>${data.note.user}</h3><h5><strong>${data.note.body}</strong></h5><br><div>`);
    } else {
      $(".notes").append(`<div class='container col-5' id='userComment'><h6 class='mt-3'><i>Last Comment:</i></h6><h4>No comments available</h4><div>`);
    }
  });
});
// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
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
      $("#notes").hide();
    });
});