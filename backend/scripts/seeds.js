//TODO: seeds script should come here, so we'll be able to put some data in our local env
var mongoose = require("mongoose");
require("../models/User");
require("../models/Item");
require("../models/Comment");
var User = mongoose.model("User");
var Item = mongoose.model("Item")
var Comment = mongoose.model("Comment")

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

const addUsers = async (count) => {
    const users = Array.from({length: count}).map((x, i) => {
        const user = new User();
        user.username = `unicorn${i+1}`;
        user.email = `user${i+1}@shirlyb.com`;
        user.setPassword(`Default_${i+1}!`);

        return user
    })

    return await User.insertMany(users).catch((error) => {
        console.log("failed creating users")
        console.log(error)
    })
}

const addItems = async (count, users) => {
    const items = Array.from({length: count}).map((x, i) => {
        const item = new Item();
        item.title = `Shiny Nail Polish ${i}`
        item.image = ""
        item.description = ""

        const itemSeller = users[getRandomInt(count)]
        item.seller = itemSeller._id

        return item
    })

    return await Item.insertMany(items).catch((error) => {
        console.log("failed creating items")
        console.log(error)
    })
}

const addComments = async (count, users, items) => {
    for await (const i of Array(count).keys()) {
        const comment = new Comment({body: `${i}`});

        const itemForCommentId = items[getRandomInt(count)]._id

        // console.log(itemForCommentId)

        comment.item = itemForCommentId
        comment.seller = users[getRandomInt(count)];

        await comment.save()

        await Item.findByIdAndUpdate(itemForCommentId, {$push: {comments: comment}})
    }
}

const loadData = async (count=100) => {
    console.log(`process.env.MONGODB_URI ${process.env.MONGODB_URI}`)
    mongoose.connect(process.env.MONGODB_URI);

    const users = await addUsers(count)
    const items = await addItems(count, users)
    const comments = await addComments(count, users, items)

    process.exit()
}


loadData()