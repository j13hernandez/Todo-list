const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
const uri = require('./secrets/mongoURI.js');

const port = 3000;
const date = require(__dirname + '/date.js');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(uri.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const workItems = [];

const itemSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model('List', listSchema);

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!',
});

const item2 = new Item({
  name: 'Click the + button to add a new item.',
});

const item3 = new Item({
  name: '<-- Click this to delete an item.',
});

const defaultItems = [item1, item2, item3];

let counter = 0;

app.get('/', (req, res) => {
  const currentDay = date.getDate();

  Item.find({}, (err, items) => {
    if (items.length === 0 && counter === 0) {
      counter++;
      Item.insertMany(defaultItems);
      console.log('Saved items to database');
      res.redirect('/');
    } else {
      res.render('list', {
        listTitle: currentDay,
        newListItem: items,
      });
    }
  });
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const currentDay = date.getDate();
  const currentTitle = req.body.button;

  const item = new Item({
    name: itemName,
  });

  if (currentTitle === currentDay) {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: currentTitle }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${currentTitle}`);
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const currentTitle = req.body.listName;
  const currentDay = date.getDate();

  if (currentTitle === currentDay) {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully deleted checked item');
      }
    });
    res.redirect('/');
  } else {
    List.findOneAndUpdate(
      { name: currentTitle },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundList) => {
        if (!err) {
          console.log('Successfully deleted checked item');
          res.redirect(`/${currentTitle}`);
        }
      }
    );
  }
});

app.get('/:param', (req, res) => {
  const custom = _.capitalize(req.params.param);

  List.findOne({ name: custom }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: custom,
          items: defaultItems,
        });
        list.save();
        res.redirect(`/${custom}`);
      } else {
        console.log('found list');
        res.render('list', {
          listTitle: foundList.name,
          newListItem: foundList.items,
        });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
