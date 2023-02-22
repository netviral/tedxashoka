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

// Clue.create(
//     {
//         _id:0,
//         code:"",
//         clue:""
//     }, function(err,res){
//         console.log(res);
//     });
// Clue.create([
// {
//     _id:1,
//     code:"BdHjiNiTWVWo",
//     clue:"Clue 1"
// },
// {
//     _id:2,
//     code:"UQMWkNTRIUcB",
//     clue:"Clue 2"
// },
// {
//     _id:3,
//     code:"g4tfyyFhASHh",
//     clue:"Clue 3"
// },
// {
//     _id:4,
//     code:"6uur9sVAjgKx",
//     clue:"Clue 4"
// },
// {
//     _id:5,
//     code:"F8ugKiBGD2hZ",
//     clue:"Clue 5"
// },
// {
//     _id:6,
//     code:"hd2SBkwrgizb",
//     clue:"Clue 6"
// },
// {
//     _id:7,
//     code:"UbCar8q9fyua",
//     clue:"Clue 7"
// },
// {
//     _id:8,
//     code:"qrm0UOmzIjlO",
//     clue:"Clue 8"
// },
// {
//     _id:9,
//     code:"uB6DRucMLKTp",
//     clue:"Clue 9"
// },
// {
//     _id:10,
//     code:"t7mxN0nUENU6",
//     clue:"Clue 10"
// },
// ]).then((result => {
//     if(result) {
//         console.log("clues added");
//     }
// })).catch(err => {
//     if(err) console.log(err); 
// });



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(port, function(req,res){
    console.log("listening on port "+ port)
});

const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
  }

  
app.use('/',express.static(__dirname+"/public",options));

app.get("/",function(req,res){
    res.render("index");
});

app.get("/about",function(req,res){
    res.render("about");
});

app.get("/speakers",function(req,res){
    res.render("speakers");
});

app.get("/event",function(req,res){
    res.render("event");
});

app.get("/partners",function(req,res){
    res.render("sponsors");
});

app.get("/register",function(req,res){
    res.render("registration");
});


app.get("/clues/:number",function(req,res){
        if(req.params.number==0){
            Team.find({},function(err,results){
                if(err){
                    console.log(err);
                }else{
                    res.render("clues",{json:results,number:0,query:req.query.code})
                }
            });
        }else if(req.params.number<=10){
        Team.find({clues:req.params.number-1},function(err,results){
            if(err){
                console.log(err);
            }else{
                res.render("clues",{json:results,number:req.params.number,query:req.query.code})
            }
        });
       }else{
        res.render("clues",{json:{},number:"Too big bro! Not gonna say what",query:req.query.code})
       } 
});

app.post("/clues/:number",function(req,res){
    Team.findOne({_id:req.body.team,code:req.body.code},function(err,results){
        if(err){
            console.log(err);
        }else{
            if(results!=null){
                if(req.params.number==0){
                    var updated=results.clues;
                    updated.includes(parseInt(req.params.number))?console.log("already there"):updated.push(parseInt(req.params.number));
                    Team.updateOne({_id:req.body.team},{clues:updated},function(err,resu){
                        if(err){
                            console.log(err);
                        } else{
                            Clue.findOne({_id:1},function(err,baby){
                                if(!err){
                                    console.log(baby);
                                    res.render("indclue",{clueText:baby.clue});
                                }
                            });             
                        }
                    });
                }else{
                    var updated=results.clues;
                    Team.find({clues:parseInt(req.params.number)-1},function(err,results){
                        if(err){
                            console.log(err);
                        }else{
                            if(results.length!=0){
                              Clue.find({_id:parseInt(req.params.number),code:req.query.code},function(err,rp){
                                if(rp.length!=0){
                                    updated.includes(parseInt(req.params.number))?console.log("already there"):updated.push(parseInt(req.params.number));
                                    Team.updateOne({_id:req.body.team},{clues:updated},function(err,resu){
                                        if(err){
                                            console.log(err);
                                        } else{
                                            var numb=parseInt(req.params.number)+1;
                                            console.log(numb);
                                            if(numb>10){
                                                res.render("indclue",{clueText:"Congratulations. Now concentrate on studies."});

                                            }else{
                                            Clue.findOne({_id:numb},function(err,baby){
                                                if(!err){
                                                console.log(req.params.number);
                                                console.log(baby);
                                                res.render("indclue",{clueText:baby.clue});
                                                }
                                            });
                                        }             

                                        }
                                    });
                                }else{
                                    res.render("indclue",{clueText:"ABHAHAHAHHA NO BRO REACH THE CLUE FIRST AND SCAN THE CODE CORRECTLY"});
                                }
                            });

                            } else{
                                res.send("NO!");
                            }
                            
                       }
                    });
                }
            }else{
                res.send("incorrect authentication code")
            }
        }
    });
});

app.post("/register",function(req,res){
    var teamName=req.body.name;
    var teamMembers=req.body.members;
    var pocName=req.body.poc;
    var pocContact=req.body.pocContact;
    var code=Math.floor(100000 + Math.random() * 900000);
    var updatedAt=new Date();
    var clues=[];
    Team.find({_id:teamName},function(err,results){
        if(results.length!=0){
            res.send("Team already registered!");
        } else{
            Team.create({
                _id:teamName,
                teamMembers:teamMembers,
                pocName:pocName,
                pocContact:pocContact,
                code:code,
                clues:[]
            }).then((result => {
                if(result) {
                    setTimeout(() => {
                        res.render("registration");
                    }, 1000)
                }
            })).catch(err => {
                if(err) console.log(err); res.send("Error in creating document. \n"+err);
            });
        }
    });
});
app.get("*",function(req,res){
    res.render("404");
});

