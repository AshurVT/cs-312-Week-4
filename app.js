const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb+srv://jde239:<password>@cluster0.ufqwgay.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "This is your Honey Do list.."
});

const item2 = new Item({
    name: "Hit the + button to add"
});

const item3 = new Item({
    name: "<= click here to remove"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



    // This part was really difficult, for some reason using function wouldnt work and i had to search to find out abouty async function and hwo to use that. Now it works!
    app.get("/", async function (req, res) {
        try 
        {
            const foundItems = await Item.find({});
            if (foundItems.length === 0) 
            {
                // I had to change this a lot of times before getting this to work as well. Want2buy updated instructions please.
                //intert from mongoose no longer supports callback, fun!
                Item.insertMany(defaultItems)
                    .then(() => 
                    {
                        console.log("Success");
                        res.redirect("/");
                    })
                    //had to get help with these. catch was expected after then then which confused me. took some time to figure out.
                .catch((err) => 
                {
                    console.log(err);
                });
            } else 
                {
                res.render("list", { listTitle: "Today", newListItems: foundItems });
                }
        } catch (err) {
            console.log(err);
        }
    });


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); 

app.post("/", function (req, res) 
{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === "Today"){
        item.save(function(err){
            if (!err) {
                res.redirect("/");
            }
        });
    } else {
        // reiterating that mongoose still doesnt like callbacks
        List.findOne({ name: listName })
        .then(foundList => {
            if (foundList) {
                foundList.items.push(item);
                foundList.save()
                .then(() => {
                    res.redirect("/" + listName);
                })
                .catch(err => {
                    console.log(err);
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
});

// async function to use await. I was trying different things so i tried await here, which works.. i'm not sure if this is best practice or not.
app.post("/delete", async function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        try {
            // still no callbacks. im so confused.
            await Item.findByIdAndDelete(checkedItemId);
            console.log("Deleted");
            res.redirect("/");
        } catch (err) {
            console.log(err);
            res.redirect("/");
        }
    } else {
        try {
            //no callback allowed AGAIN. thanks mongoose.
            await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
            res.redirect("/" + listName);
        } catch (err) {
            console.log(err);
            res.redirect("/" + listName);
        }
    }
});


 
app.get("/:customListName", async function(req,res) 
{
    const customListName = req.params.customListName;
    try 
    {
        const foundList = await List.findOne({ name: customListName });

        if (!foundList) 
            {
            const list = new List(
                {
                name: customListName,
                items: defaultItems
            });

            await list.save();
            res.redirect("/" + customListName);
            } else 
            {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
    } catch (err) 
    {
        console.log(err);
    }
});

app.get("/about", function (req, res) 
{
    res.render("about");
})
app.post("./work", function (req, res) 
{
    let item = req.body.newItem
    workItems.push(item);
    res.redirect("/work");
})

app.listen(3000, function () 
{
    console.log("Server started on port 3000");
});


app.use(express.static("public"));