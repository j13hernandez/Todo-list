const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const date = require(__dirname + '/date.js');

const items = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  const currentDay = date.getDate();

  res.render('list', { listTitle: currentDay, newListItem: items });
});

app.post('/', (req, res) => {
  if (req.body.button === 'Work') {
    workItems.push(req.body.newItem);
    res.redirect('/work');
  } else {
    items.push(req.body.newItem);
    res.redirect('/');
  }
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
