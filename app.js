const express=require("express");
const app=express();
const port=process.env.PORT || 3000;
const bodyParser=require("body-parser");
const fs = require('fs');
const content = `{"hello":"aa"}`;
const ejs=require("ejs");
const mongoose = require('mongoose');
var cors = require('cors')
app.use(cors())

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


app.get("/lead",function(req,res){
    if(req.query.key=="tedxashoka"){
        Team.find({}).sort({'clues':-1,'updatedAt':1}).exec(function(err, docs) { res.send(docs); });
    }else{
        res.send(404);
    }
});

app.get("/partners",function(req,res){
    res.render("sponsors");
});

app.get("/register",function(req,res){
    res.render("registration");
});

app.get("/data",function(req,res){
    if(req.query.key=="tedxashoka"){
    Clue.find({},function(err,docs){
        if(err){
            console.log(err);
        }else{
            res.send(docs);
        }
    })
} else{
    res.send(404);
}
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
                                                res.render("indclue",{clueText:"You've finished all your clues. Please reach back to the leaderboard at the meeting spot."});

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
                                    res.render("indclue",{clueText:"ABHAHAHAHHA NO BRO SCAN THE CODE CORRECTLY"});
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