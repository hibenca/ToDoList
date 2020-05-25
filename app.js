// required framework imports
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

// storing express in "app" for ease of use
const app = express();

// Mongoose boilerplate
mongoose.connect("mongodb://localhost:27017/ToDoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Default Schema
const itemsSchema = {
  name: String
};

// Mongoose model Schema creation
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

// Default items array
const defaultItems = [item1, item2, item3];

// New todo list Schema using the pre-existing itemsSchema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

// New todo model list Mongoose Scema creation
const List = mongoose.model("List", listSchema);


// EJS boilerplate
app.set('view engine', 'ejs');

// express boilerplate
app.use(express.static("public"));
app.use(bodyparser.urlencoded({
  extended: true
}));

// home get route that loads the current todo list from MongoDB using Mongoose
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
        listTitle: "Today",
        newItems: foundItems
      });
    }
  });
});

// home post route that adds new items to the MongoDB todo list
app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// Deletes todo list items by clicking the checkbox
app.post("/delete", function(req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
      Item.findByIdAndRemove(checkItemId, function(err) {
        if (!err) {
          console.log("successfully deleted checked item.");
          res.redirect("/");
        }
      })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

// Creates an express dynamic peramiters page
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          item: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // Show an existing list
        res.render("index", {
          listTitle: foundList.name,
          newItems: foundList.items
        });
        console.log("Exists");
      }
    }
  });
});

// Loads server when localhost:3000 is put into the browser
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
