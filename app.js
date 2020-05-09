const express = require('express');
const bodyparser = require('body-parser');
const date = require(__dirname + '/date.js');


const app = express();

items = ["Buy food", "Cook Food", "Eat Food"];

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyparser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {

let day = date.todaysDate();

  res.render('index', {
    theDay: day,
    newItems: items
  });
});

app.post("/", function(req, res) {
  let newItem = req.body.newItem;

  items.push(newItem);

  res.redirect("/");

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
