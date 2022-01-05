const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');

const port = 3000;
const date = require(__dirname + '/date.js');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/todoListDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const workItems = [];

const itemSchema = new mongoose.Schema({
  name: String,
});

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

app.get('/', (req, res) => {
  const currentDay = date.getDate();

  Item.find({}, (err, items) => {
    if (items.length === 0) {
      item1.save();
      item2.save();
      item3.save();
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
  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect('/');
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Successfully deleted checked item');
    }
  });
  res.redirect('/');
});

app.get('/work', (req, res) => {
  res.render('list', { listTitle: 'Work', newListItem: workItems });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
