// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/rajwadaBilling')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Failed:", err));

const billingSchema = new mongoose.Schema({
  order_no: String,
  booking_date: String,
  delivery_date: String,
  customer_name: String,
  address: String,
  phone: String,
  items: Array,
  total: Number,
  advance: Number,
  balance: Number
});

const Billing = mongoose.model('Billing', billingSchema);

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit', async (req, res) => {
  const data = {
    order_no: req.body.order_no,
    booking_date: req.body.booking_date,
    delivery_date: req.body.delivery_date,
    customer_name: req.body.customer_name,
    address: req.body.address,
    phone: req.body.phone,
    items: req.body.description.map((desc, index) => ({
      sno: req.body.sno[index],
      description: desc,
      amount: req.body.amount[index]
    })),
    total: req.body.total,
    advance: req.body.advance,
    balance: req.body.balance
  };

  const bill = new Billing(data);
  await bill.save();
  res.redirect(`/display/${bill._id}`);
});

app.get('/display/:id', async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  res.render('display', { bill });
});

app.get('/all-bills', async (req, res) => {
  try {
    const bills = await Billing.find().sort({ _id: -1 });
    res.render('allBills', { bills });
  } catch (err) {
    res.status(500).send('Error loading bills');
  }
});
app.get('/edit/:id', async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  res.render('editForm', { bill });
});
app.post('/delete/:id', async (req, res) => {
  await Billing.findByIdAndDelete(req.params.id);
  res.redirect('/all-bills');
});

app.post('/update/:id', async (req, res) => {
  const updatedData = {
    order_no: req.body.order_no,
    booking_date: req.body.booking_date,
    delivery_date: req.body.delivery_date,
    customer_name: req.body.customer_name,
    address: req.body.address,
    phone: req.body.phone,
    items: req.body.description.map((desc, index) => ({
      sno: req.body.sno[index],
      description: desc,
      amount: req.body.amount[index]
    })),
    total: req.body.total,
    advance: req.body.advance,
    balance: req.body.balance
  };

  await Billing.findByIdAndUpdate(req.params.id, updatedData);
  res.redirect('/all-bills');
});


app.listen(3000, () => console.log('Server running at http://localhost:3000'));
