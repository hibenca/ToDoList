const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

mongoose.connect("mongodb://localhost:27017/ToDoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

// Default items
const item1 = new Item({
  name: "Buy food"
});

const item2 = new Item({
  name: "Cook food"
});

const item3 = new Item({
  name: "Eat food"
});

const defaultItems = [item1, item2, item3];

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyparser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Way to save default items bro");
        }
      });
      res.redirect("/");
    } else {
      res.render('index', {
        theDay: "Today",
        newItems: foundItems
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");

});

app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkItemId, function(err) {
    if (!err) {
      console.log("successfully deleted checked item.");
      res.redirect("/");
    }
  })
})

// Create express dynamic peramiters

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
