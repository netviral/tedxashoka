const express=require("express");
const app=express();
const port=process.env.PORT || 3000;
const bodyParser=require("body-parser");
const fs = require('fs');
const content = `{"hello":"aa"}`;
const ejs=require("ejs");
const mongoose = require('mongoose');
app.set('view engine', 'ejs');
// Mongoose configuration
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/tedx", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Declare a new mongoose schema for database
const schema = new mongoose.Schema({
    _id:String,
    teamMembers:String,
    pocName:String,
    pocContact:String,
    code:Number,
    clues:[Number],
  },{ timestamps: true });

  const clues = new mongoose.Schema({
    _id:Number,
    code:String,
    clue:String,
  });

// Create a model following the defined schema
const Team = mongoose.model('Team', schema);
const Clue = mongoose.model('Clue', clues);

