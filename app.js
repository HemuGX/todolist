//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash")


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Create Mongoose Connection

mongoose.connect("mongodb+srv://HemuGX:ohokaybro@cluster0.xshap.mongodb.net/todolist2DB")  //mongodb://localhost:27017/todo5DB

//Create Schemas

const itemSchema = mongoose.Schema({
  Name: String
});

const listSchema = mongoose.Schema ({
  Name: String,
  Item: [itemSchema]
})

//Create Model

const Item = mongoose.model("Item",itemSchema);

const List = mongoose.model("List",listSchema);

//Default Items

const item1 = new Item ({
  Name: "Welcome"
})

const item2 = new Item ({
  Name: "Have Fun"
})

const defaultItems = [item1,item2]

app.get("/", function(req, res) {

const day = date.getDate();

Item.find({},function(err,foundItems){  //Find all the items in Item collection.
  if(err) {
    console.log(err);
  } else {
    if (foundItems.length === 0) {  //Check if the collection is empty.
      Item.insertMany(defaultItems,function(err) {   //If its empty Insert all the dafault items.
        if(err) {
          log(err)
        } else {
          console.log("Submitted default items to DB");
        }
        res.redirect("/")   //After inserting items this will reload the page which will allow it to render the items.
      })
    }  else {
      res.render("list",{listTitle: day, newListItems: foundItems})    //If its not empty,jurt render what is in the collection.
    }
  }
})

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;

  const pageName = req.body.list
  const item = new Item ({
    Name: newItem
  });


  if (pageName === date.getDate() ) {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({Name: pageName},function(err,foundList) {  //We are looking for the name of the item thats connected with the heading.
      foundList.Item.push(item);
      foundList.save()
      res.redirect("/"+ pageName)
    })
  }


});

app.post("/delete",function (req,res) {
  const deleteID = req.body.checkboxed;
  const pageName = req.body.pageName;

  if(pageName === date.getDate() ) {
    Item.findByIdAndRemove(deleteID,function(err) {
      if(!err) {
        console.log("Deleted item with ID " + deleteID);
      }
      res.redirect("/")
    })
  } else {
    List.findOneAndUpdate({Name: pageName},{$pull: {Item: {_id: deleteID}}},function(err,found){
      if(!err) {
        console.log("Deleted item with ID " + deleteID);
      }
      res.redirect("/"+ pageName)
    })
  }



})

app.get("/:newList",function(req,res) {
  const newList = _.capitalize(req.params.newList);  //This will capitalize the word which will assure that the name property wont be duplicated.

  const list = new List ({
    Name: newList,
    Item: defaultItems
  })



  List.findOne({Name: newList},function(err,foundList) {
    if(err) {
      console.log(err);
    } else {
      if(!foundList) {
        list.save()
        res.redirect("/"+ newList)
      } else {
        //console.log(foundList);
        res.render("list",{listTitle: foundList.Name , newListItems: foundList.Item})
      }

    }
  })

})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT, function() {
  console.log("Server started on port 3000");
});
