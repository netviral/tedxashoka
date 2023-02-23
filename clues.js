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


Clue.create([
{
    _id:1,
    code:"BdHjiNiTWVWo",
    clue:"The average Ashokans caffeine, couch, and courework paradise. "
},
{
    _id:2,
    code:"UQMWkNTRIUcB",
    clue:"What price went up first: the chicken sandwich or the omlette?!"
},
{
    _id:3,
    code:"g4tfyyFhASHh",
    clue:"Kiss your partner 30 feet in the air."
},
{
    _id:4,
    code:"6uur9sVAjgKx",
    clue:"Search high and low, and look all around. In a place where people meet the ground, it stands alone on its peak, the lonely twin awaits your feet."
},
{
    _id:5,
    code:"F8ugKiBGD2hZ",
    clue:"You must split the team in two for each half of the clue lies in different places. Morse code that says HDFC."
},
{
    _id:6,
    code:"hd2SBkwrgizb",
    clue:""
},
{
    _id:7,
    code:"UbCar8q9fyua",
    clue:"Follow this link for the clue: https://youtu.be/dBJpKGMyT6Q"
},
{
    _id:8,
    code:"qrm0UOmzIjlO",
    clue:"Where athletes sweat and fans cheer, a place where points are made quite clear. On this place of hardwood frame, economic principles are also in the game. Look for a place of great competition, where supply and demand are in full fruition. From guessing oponent's plays to team player auctions, the realities here will unveil economic situations. So lace up your shoes and take a shot, the ________ _______ has the clue you sought."
},
{
    _id:9,
    code:"uB6DRucMLKTp",
    clue:"Error 102: this sculpture has already been booked."
},
{
    _id:10,
    code:"t7mxN0nUENU6",
    clue:"YOUR STAGE is what you seek, at TedXAshoka many will speak. You've reached the end of this fight, for the treasure is hiding in plain sight."
},
]).then((result => {
    if(result) {
        console.log("clues added");
    }
})).catch(err => {
    if(err) console.log(err); 
});