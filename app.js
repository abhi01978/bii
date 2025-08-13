const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Connect
mongoose.connect('mongodb+srv://abhishek:QaBYoGubKnvd3B6h@cluster0.qzdid.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

// ✅ Schema (single description)
const billingSchema = new mongoose.Schema({
  order_no: String,
  booking_date: String,
  delivery_date: String,
  customer_name: String,
  address: String,
  phone: String,
  description: String, // single field
  total: Number,
  advance: Number,
  balance: Number
});

const Billing = mongoose.model('Billing', billingSchema);

// ✅ Home Page
app.get('/', (req, res) => {
  res.render('form');
});

// ✅ Save Bill
app.post('/submit', async (req, res) => {
  const data = {
    order_no: req.body.order_no,
    booking_date: req.body.booking_date,
    delivery_date: req.body.delivery_date,
    customer_name: req.body.customer_name,
    address: req.body.address,
    phone: req.body.phone,
    description: Array.isArray(req.body.description) ? req.body.description.join(", ") : req.body.description,
    total: parseFloat(req.body.total) || 0,
    advance: parseFloat(req.body.advance) || 0,
    balance: parseFloat(req.body.balance) || 0
  };

  const bill = new Billing(data);
  await bill.save();
  res.redirect(`/display/${bill._id}`);
});

// ✅ Display Bill
app.get('/display/:id', async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  res.render('display', { bill });
});

// ✅ All Bills
app.get('/all-bills', async (req, res) => {
  try {
    const bills = await Billing.find().sort({ _id: -1 });
    res.render('allBills', { bills });
  } catch (err) {
    res.status(500).send('Error loading bills');
  }
});

// ✅ Edit Bill
app.get('/edit/:id', async (req, res) => {
  const bill = await Billing.findById(req.params.id);
  res.render('editForm', { bill });
});

// ✅ Delete Bill
app.post('/delete/:id', async (req, res) => {
  await Billing.findByIdAndDelete(req.params.id);
  res.redirect('/all-bills');
});

// ✅ Update Bill
app.post('/update/:id', async (req, res) => {
  const updatedData = {
    order_no: req.body.order_no,
    booking_date: req.body.booking_date,
    delivery_date: req.body.delivery_date,
    customer_name: req.body.customer_name,
    address: req.body.address,
    phone: req.body.phone,
description: Array.isArray(req.body.description) ? req.body.description.join(", ") : req.body.description,
    total: parseFloat(req.body.total) || 0,
    advance: parseFloat(req.body.advance) || 0,
    balance: parseFloat(req.body.balance) || 0
  };

  await Billing.findByIdAndUpdate(req.params.id, updatedData);
  res.redirect('/all-bills');
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
