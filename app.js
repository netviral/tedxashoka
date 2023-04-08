const express=require("express");
const app=express();
const port=process.env.PORT || 3000;
const bodyParser=require("body-parser");
const fs = require('fs');
const content = `{"hello":"aa"}`;
const ejs=require("ejs");
const mongoose = require('mongoose');
var cors = require('cors')
app.use(cors());
const nodemailer = require('nodemailer');

//test
//test

/* 
mxiarrcrkcjiofpy
*/

let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tedx@ashoka.edu.in',
            pass: 'ocrd oyeq wtxq rwne'
        }
});

function validateEmail(email){
    if(email.slice(0,-14)==""){
        return email;
    }else if(email.slice(0,-14).includes(".") || email.slice(0,-14).includes("_")){
        return email;
    }else{
        return "ibrahim.khalil_ug25@ashoka.edu.in"
    }
}

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

  const registrations = new mongoose.Schema({
    name:String,
    email:String,
    phone:Number,
    batch:String,
    otp:Number,
    confirmed:Boolean,
    code:Number
  });

// Create a model following the defined schema
const Team = mongoose.model('Team', schema);
const Clue = mongoose.model('Clue', clues);
const Registrations = mongoose.model('Registrations', registrations);



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

app.get("/eregister",function(req,res){
    Registrations.find({confirmed:true},function(err,docs){
        if(docs.length<2){
            res.render("eregister",{shut:false});
        }else{
            res.render("eregister",{shut:true});
        }
    });
});


app.get("/data",function(req,res){
    if(req.query.key=="ursajahana"){    
        Registrations.find({},{'_id': false},function(err,docs){
            if(!err){
                res.send(docs);
            }else{
                res.send(err);
            }
        });
    }else{
        res.render("404");
    }
});

function generateOTP() {
          
    // Declare a string variable 
    // which stores all string
    var string = '123456789';
    let OTP = '';
      
    // Find the length of string
    var len = string.length;
    for (let i = 0; i < 4; i++ ) {
        OTP += string[Math.floor(Math.random() * len)];
    }
    return +OTP;
}


app.post("/get-otp",function(req,res){
    Registrations.findOne({email:req.body.email},function(err,doc){
        if(!err){           
            if(doc!=null){
                var name=req.body.name;
                if(doc.confirmed){
                    res.status(403).send("Already Confirmed!");
                }else{
                    if(doc.otp>0){
                        res.status(403).send("Already issued OTP!");
                    }else{
                        let otp=generateOTP();
                        let mailDetails = {
                            from: 'tedx@ashoka.edu.in',
                            to: validateEmail(req.body.email),
                            subject: 'TEDxAshokaUniversity | OTP',
                            html: 
                            `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;background:#000;">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #fff;text-decoration:none;font-weight:600"><font color="#eb0028">TEDx</font>AshokaUniversity</a>
          </div>
          <p style="font-size:1.1em;color:#fff;">Hi, ${name}</p>
          <p style="font-size:1.1em;color:#fff;">Thank you for your interest in TEDxAshokaUniversity. Use the following OTP to complete your Registration procedure. OTP is valid for 3 minutes</p>
          <h2 style="background: #eb0028;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
          <p style="font-size:0.9em;color:#fff;">Regards,<br />TEDxAshokaUniversity</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>TEDxAshokaUniversity</p>
            <p>Sonipat, Haryana</p>
          </div>
        </div>
      </div>
</body>
</html>`
                        };
                        mailTransporter.sendMail(mailDetails, function(err, data) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('Email sent successfully');
                            }
                        });
                        Registrations.findOneAndUpdate({email: req.body.email}, 
                            {otp:otp}, null, function (err, docs) {
                            if (err){
                                console.log(err)
                            }
                            else{
                                console.log("Original Doc : ",docs);
                            }
                        });

                        setTimeout(function(){
                            console.log('in set timeout');
                            Registrations.findOneAndUpdate({email: req.body.email}, 
                                {otp:-1}, null, function (err, docs) {
                                if (err){
                                    console.log(err)
                                }
                                else{
                                    console.log("Original Doc : ",docs);
                                }
                            });
                        },180000);
                        res.status(200).send("Successfully Registered!")

                    }  
                }
            }else{
                var otp=generateOTP();
                var name=req.body.name;
                Registrations.countDocuments({confirmed:true}, function(err, c) {
               
                Registrations.create({
                    name:name,
                    email:req.body.email,
                    phone:req.body.phone,
                    batch:req.body.batch,
                    otp:otp,
                    confirmed:false,
                    code:c+100
                }).then((result => {
                    if(result) {
                        let mailDetails = {
                            from: 'tedx@ashoka.edu.in',
                            to: validateEmail(req.body.email),
                            subject: 'TEDxAshokaUniversity | OTP',
                            html: `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Document</title>
                            </head>
                            <body>
                                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;background:#000;">
                                    <div style="margin:50px auto;width:70%;padding:20px 0">
                                      <div style="border-bottom:1px solid #eee">
                                        <a href="" style="font-size:1.4em;color: #fff;text-decoration:none;font-weight:600"><font color="#eb0028">TEDx</font>AshokaUniversity</a>
                                      </div>
                                      <p style="font-size:1.1em;color:#fff;">Hi, ${name}</p>
                                      <p style="font-size:1.1em;color:#fff;">Thank you for your interest in TEDxAshokaUniversity. Use the following OTP to complete your Registration procedure. OTP is valid for 3 minutes</p>
                                      <h2 style="background: #eb0028;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                                      <p style="font-size:0.9em;color:#fff;">Regards,<br />TEDxAshokaUniversity</p>
                                      <hr style="border:none;border-top:1px solid #eee" />
                                      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                        <p>TEDxAshokaUniversity</p>
                                        <p>Sonipat, Haryana</p>
                                      </div>
                                    </div>
                                  </div>
                            </body>
                            </html>`
                        };
                        mailTransporter.sendMail(mailDetails, function(err, data) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('Email sent successfully');
                            }
                        });
                        setTimeout(function(){
                            Registrations.findOneAndUpdate({email: req.body.email}, 
                                {otp:-1}, null, function (err, docs) {
                                if (err){
                                    console.log(err)
                                }
                                else{
                                    console.log("Original Doc : ",docs);
                                }
                            });
                        },180000);
                        res.status(202).send("OTP sent!")
                    }
                })).catch(err => {
                    if(err) console.log(err); res.send("Error in creating document. \n"+err);
                });
            });
            }
        }else{
            // console.log(err);
        }
    })
});


app.post("/verify-otp",function(req,res){
    Registrations.findOne({email:req.body.email},function(err,doc){
        if(!err){
            if(doc){
                if(doc.confirmed){
                    res.status(403).send("Already confirmed!")
                }else{

                    Registrations.findOne({email:req.body.email},function(err,doc){
                        if(!err){
                            if(req.body.otp==doc.otp){
                                Registrations.findOneAndUpdate({email: req.body.email}, 
                                    {confirmed:true,otp:-1}, null, function (err, docs) {
                                    fullname=docs.name;
                                    phone=docs.phone;
                                    email=docs.email;
                                    select=docs.batch;
                                    subwayCode=docs.code;

                                    if (err){
                                        console.log(err)
                                    }
                                    else{
 
                                        res.status(202).send("Registration Successful");
                                        let mailDetails = {
                                            from: 'tedx@ashoka.edu.in',
                                            to: validateEmail(req.body.email),
                                            subject: 'TEDxAshokaUniversity | Ticket',
                                            html: module.exports=`<!doctype html>
                                            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                                            
                                            <head>
                                              <title>
                                              </title>
                                              <!--[if !mso]><!-->
                                              <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                              <!--<![endif]-->
                                              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                                              <meta name="viewport" content="width=device-width, initial-scale=1">
                                              <style type="text/css">
                                                #outlook a {
                                                  padding: 0;
                                                }
                                            
                                                body {
                                                  margin: 0;
                                                  padding: 0;
                                                  -webkit-text-size-adjust: 100%;
                                                  -ms-text-size-adjust: 100%;
                                                }
                                            
                                                table,
                                                td {
                                                  border-collapse: collapse;
                                                  mso-table-lspace: 0pt;
                                                  mso-table-rspace: 0pt;
                                                }
                                            
                                                img {
                                                  border: 0;
                                                  height: auto;
                                                  line-height: 100%;
                                                  outline: none;
                                                  text-decoration: none;
                                                  -ms-interpolation-mode: bicubic;
                                                }
                                            
                                                p {
                                                  display: block;
                                                  margin: 13px 0;
                                                }
                                            
                                              </style>
                                              <!--[if mso]>
                                                <noscript>
                                                <xml>
                                                <o:OfficeDocumentSettings>
                                                  <o:AllowPNG/>
                                                  <o:PixelsPerInch>96</o:PixelsPerInch>
                                                </o:OfficeDocumentSettings>
                                                </xml>
                                                </noscript>
                                                <![endif]-->
                                              <!--[if lte mso 11]>
                                                <style type="text/css">
                                                  .mj-outlook-group-fix { width:100% !important; }
                                                </style>
                                                <![endif]-->
                                              <style type="text/css">
                                                @media only screen and (min-width:480px) {
                                                  .mj-column-per-100 {
                                                    width: 100% !important;
                                                    max-width: 100%;
                                                  }
                                            
                                                  .mj-column-per-50 {
                                                    width: 50% !important;
                                                    max-width: 50%;
                                                  }
                                                }
                                            
                                              </style>
                                              <style media="screen and (min-width:480px)">
                                                .moz-text-html .mj-column-per-100 {
                                                  width: 100% !important;
                                                  max-width: 100%;
                                                }
                                            
                                                .moz-text-html .mj-column-per-50 {
                                                  width: 50% !important;
                                                  max-width: 50%;
                                                }
                                            
                                              </style>
                                              <style type="text/css">
                                                @media only screen and (max-width:480px) {
                                                  table.mj-full-width-mobile {
                                                    width: 100% !important;
                                                  }
                                            
                                                  td.mj-full-width-mobile {
                                                    width: auto !important;
                                                  }
                                                }
                                            
                                              </style>
                                              <style type="text/css">
                                                @media screen {
                                                  @font-face {
                                                    font-family: 'Lato';
                                                    font-style: normal;
                                                    font-weight: 400;
                                                    src: local('Lato Regular'), local('Lato-Regular'),
                                                      url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                                                  }
                                            
                                                  @font-face {
                                                    font-family: 'Lato';
                                                    font-style: normal;
                                                    font-weight: 700;
                                                    src: local('Lato Bold'), local('Lato-Bold'),
                                                      url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                                                  }
                                            
                                                  @font-face {
                                                    font-family: 'Lato';
                                                    font-style: italic;
                                                    font-weight: 400;
                                                    src: local('Lato Italic'), local('Lato-Italic'),
                                                      url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                                                  }
                                            
                                                  @font-face {
                                                    font-family: 'Lato';
                                                    font-style: normal;
                                                    font-weight: 900;
                                                    src: local('Lato Black'), local('Lato-Black'),
                                                      url(https://fonts.gstatic.com/s/lato/v14/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2) format('woff2');
                                                  }
                                            
                                                  @font-face {
                                                    font-family: 'Telefon Black';
                                                    font-style: normal;
                                                    font-weight: 900;
                                                    src: url(https://assets.codepen.io/t-1/telefon-black.woff2) format('woff2');
                                                  }
                                                }
                                            
                                                body {
                                                  font-family: Lato, 'Lucida Grande', 'Lucida Sans Unicode', Tahoma, sans-serif;
                                                  font-size: 18px;
                                                  line-height: 1.5;
                                                  color: #e3e4e8;
                                                }
                                            
                                                img {
                                                  border: 0;
                                                  height: auto;
                                                  line-height: 100%;
                                                  outline: none;
                                                  text-decoration: none;
                                                  max-width: 100%;
                                                }
                                            
                                                p,
                                                li {
                                                  color: #e3e4e8;
                                                  line-height: 1.5;
                                                  font-size: 18px;
                                                  margin: 0 0 15px 0;
                                                }
                                            
                                                li {
                                                  margin-bottom: 10px;
                                                }
                                            
                                                blockquote {
                                                  background: none;
                                                  border-left: 1px solid gray;
                                                  padding-left: 10px;
                                                  margin: 0 0 15px 10px;
                                                }
                                            
                                                h1,
                                                h2,
                                                h3 {
                                                  color: white;
                                                }
                                            
                                                h1 {
                                                  font-size: 25px;
                                                  margin: 0;
                                                  line-height: 1.2;
                                                }
                                            
                                                h2 {
                                                  font-size: 26px;
                                                  margin: 0;
                                                  line-height: 1.2;
                                                }
                                            
                                                h3 {
                                                  font-size: 24px;
                                                  margin: 20px 0 10px 0;
                                                  line-height: 1.2;
                                                }
                                            
                                                .news-content a,
                                                .spark-item a,
                                                .subscription-details a,
                                                .pro-content p{
                                                  text-decoration: none;
                                                  color: #9dabc9;
                                                  font-size: 16px;
                                                }
                                            
                                                pre {
                                                  white-space: pre-wrap;
                                                  line-height: 1.8;
                                                  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
                                                }
                                            
                                                .view-on-web-link {
                                                  color: #74c5ff;
                                                  text-transform: uppercase;
                                                  display: block;
                                                  padding: 5px 10px;
                                                  background: #383b43;
                                                  width: 66%;
                                                  margin: 0 auto;
                                                  clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
                                                  text-decoration: none;
                                                }
                                            
                                                .dedicated-hero-area-copy {
                                                  padding: 20px;
                                                }
                                            
                                                .dedicated-hero-area-copy h2 {
                                                  font-family: 'Telefon Black', system-ui, Lato, sans-serif;
                                                  text-align: center;
                                                  margin: 0 0 20px 0;
                                                  font-size: 32px;
                                                  line-height: 1;
                                                }
                                            
                                                .spark-item {
                                                  margin-bottom: 50px;
                                                }
                                            
                                                .spark-item[data-type='sponsor'] .spark-item-type {
                                                  color: #fedd41;
                                                }
                                            
                                                .spark-item-type {
                                                  color: #99a3bc;
                                                  padding-bottom: 3px;
                                                  text-transform: uppercase;
                                                  letter-spacing: 2px;
                                                  font-size: 10px;
                                                }
                                            
                                                .spark-title {
                                                  font-weight: bold;
                                                  color: #505050;
                                                  padding: 5px 0 5px 0;
                                                  font-size: 20px;
                                                }
                                            
                                                .spark-desc {
                                                  padding-top: 4px;
                                                  color: #cccfdc;
                                                  font-size: 16px;
                                                  line-height: 1.5;
                                                }
                                            
                                                .spark-thumb {
                                                  border: 0;
                                                  display: block;
                                                  height: auto;
                                                  max-width: 100%;
                                                  outline: none;
                                                  text-decoration: none;
                                                  margin: 0 0 10px 0;
                                                }
                                            
                                                .news-header {
                                                  font-family: 'sans-serif', system-ui, Lato, sans-serif;
                                                  margin: 0 0 5px 0;
                                                  font-size: 36px;
                                                  text-align: left;
                                                  color: white;
                                                }
                                            
                                                .news-bar {
                                                  height: 5px;
                                                  border-radius: 100px;
                                                  background: white;
                                                  background: linear-gradient(92.63deg,
                                                      #769aff 8.23%,
                                                      #ffdd40 25.83%,
                                                      #f19994 51.91%,
                                                      #47cf73 68.56%);
                                                  width: 70%;
                                                  margin: 0 0 10px 0;
                                                }
                                            
                                                .pro-bar {
                                                  height: 5px;
                                                  border-radius: 100px;
                                                  background: #fff;
                                                  width: 70%;
                                                  margin: 0 0 10px 0;
                                                }
                                            
                                                .pro-header {
                                                  text-align: left;
                                                }
                                            
                                                .pro-header a {
                                                  color: #fff;
                                                  text-decoration: none;
                                                }
                                            
                                                .footer-bar {
                                                  height: 10px;
                                                  background: #fff;
                                                }
                                            
                                                @media only screen and (max-width: 400px) {
                                                  h1 {
                                                    font-size: 22px;
                                                  }
                                            
                                                  p {
                                                    font-size: 14px;
                                                  }
                                            
                                                  .spark-thumb {
                                                    display: block;
                                                    max-width: 100% !important;
                                                    padding-left: 0 !important;
                                                    padding-right: 0 !important;
                                                  }
                                                }
                                            
                                              </style>
                                            </head>
                                            
                                            <body style="word-spacing:normal;background-color:#1c1d22;">
                                            <div style="color:transparent;visibility:hidden;opacity:0;font-size:0px;border:0;max-height:1px;width:1px;margin:0px;padding:0px;border-width:0px!important;display:none!important;line-height:0px!important;"><img border="0" width="1" height="1" src="http://post.spmailtechnolo.com/q/VF_yl9MW9-8iCUtr1HQjUg~~/AABEfgA~/RgRlRAoyPVcDc3BjQgpjT0mFYWMbI1ZsUhJpYmJhMjAwNEBnbWFpbC5jb21YBAAAAAA~" alt=""/></div>
                                            
                                              <div style="background-color:#fff;">
                                                <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#434857" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                                <div style="background:#434857;background-color:#434857;margin:0px auto;max-width:600px;">
                                                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#434857;background-color:#131417;width:100%;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
                                                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                                                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                                              <tbody>
                                                                <tr>
                                                                  <td align="center" style="font-size:0px;padding:0;word-break:break-word;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td style="width:600px;">
                                                                            <img height="auto" src="https://tedxashokauniversity.com/email/tedx" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="600" />
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                                <tr></tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:20px;padding-right:35px;padding-bottom:0;padding-left:35px;word-break:break-word;">
                                                                    <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:white;"><br>Name:
                                                                      </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:0;padding-right:35px;padding-left:35px;word-break:break-word;">
                                                                      <div style="font-family:'sans-serif', system-ui, sans-serif;font-size:13px;line-height:125%;text-align:left;color:#e7f0ff;">
                                                                      <p><font size = "5">${fullname}</font></p>
                                                                    </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:10px;padding-right:35px;padding-bottom:0;padding-left:35px;word-break:break-word;">
                                                                    <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:white;"><br>Phone:
                                                                      </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:0;padding-right:35px;padding-left:35px;word-break:break-word;">
                                                                      <div style="font-family:'sans-serif', system-ui, sans-serif;font-size:13px;line-height:125%;text-align:left;color:#e7f0ff;">
                                                                      <p><font size = "5">${phone}</font></p>
                                                                    </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:10px;padding-right:35px;padding-bottom:0;padding-left:35px;word-break:break-word;">
                                                                    <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:white;"><br>E-mail:
                                                                      </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:0;padding-right:35px;padding-left:35px;word-break:break-word;">
                                                                      <div style="font-family:'sans-serif', system-ui, sans-serif;font-size:13px;line-height:1.2;text-align:left;color:#e7f0ff;">
                                                                      <p><font size = "5">${email}</font></p>
                                                                    </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:10px;padding-right:35px;padding-bottom:0;padding-left:35px;word-break:break-word;">
                                                                    <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:white;"><br>Batch:
                                                                      </div>
                                                                  </td>
                                                                </tr>
                                                                <tr>
                                                                  <td align="left" style="font-size:0px;padding-top:0;padding-right:35px;padding-left:35px;padding-bottom:10px;word-break:break-word;">
                                                                      <div style="font-family:'sans-serif', system-ui, sans-serif;font-size:13px;line-height:1.2;text-align:left;color:#e7f0ff;">
                                                                      <p><font size = "5">${select}</font></p>
                                                                    </div>
                                                                  </td>
                                                                </tr>
                                                                <tr></tr>
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                          <!--[if mso | IE]></td></tr></table><![endif]-->
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                                <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#333845" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                                
                                                <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#131417" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                                <div style="background:#131417;background-color:#131417;margin:0px auto;max-width:600px;">
                                                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#131417;background-color:#000;width:100%;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="direction:ltr;font-size:0px;padding:20px 0;padding-top:15px;text-align:center;">
                                                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                                                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                              <tbody>
                                                                <tr>
                                                                  <td style="vertical-align:top;padding:15px;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                            <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:#e3e4e8;">
                                                                              <mj-raw>
                                                                                <h2 class="news-header" style="margin: 0 0 5px 0;">
                                                                                  14th April, 2023 | 3:00 PM
                                                                                </h2>
                                                                                <p style="color: #9dabc9; margin: 0 0 15px 0;font-size: 16px;">Reddy's Auditorium.</p>                                  </mj-raw>
                                                                              
                                                                            </div>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                <div style="background:#131417;background-color:#131417;margin:0px auto;max-width:600px;">
                                                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#131417;background-color:#131417;width:100%;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="direction:ltr;font-size:0px;padding:20px 0;padding-top:15px;text-align:center;">
                                                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                                                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                              <tbody>
                                                                <tr>
                                                                  <td style="vertical-align:top;padding:15px;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                            <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:#e3e4e8;">
                                                                              <mj-raw>
                                                                                <h2 class="news-header" style="margin: 0 0 5px 0;">
                                                                                  Your <img src="https://tedxashokauniversity.com/email/subway" style="width: 145px;" /> code: ${subwayCode}
                                                                                </h2>
                                                                                <p style="color: #9dabc9; margin: 0 0 15px 0;font-size: 16px;">Show the ticket and code to the cashier at Subway to avail 20% discount on your order. Redeemable only once.</p>
                                                                                <div class="news-bar"></div>
                                                                              </mj-raw>
                                                                              
                                                                            </div>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                          <!--[if mso | IE]></td></tr></table><![endif]-->
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                                <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#333845" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                                <div style="background:#333845;background-color:#333845;margin:0px auto;max-width:600px;">
                                                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#333845;background-color:#000;width:100%;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                                                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                                                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                              <tbody>
                                                                <tr>
                                                                  <td style="vertical-align:top;padding:15px;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                            <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:#e3e4e8;">
                                                                              <mj-raw>
                                                                                <h2 class="pro-header">
                                                                                    <a href="http://post.spmailtechnolo.com/f/a/BpwgDavF36aVAHLScnUsVA~~/AABEfgA~/RgRlRAoyP0QXaHR0cHM6Ly9jb2RlcGVuLmlvL3Byby9XA3NwY0IKY09JhWFjGyNWbFISaWJiYTIwMDRAZ21haWwuY29tWAQAAAAA"> About <font color="eb0028">TEDx</font>AshokaUniversity </a>
                                                                                </h2>
                                                                                <div class="pro-bar"></div>
                                                                                <div class="pro-content">
                                                                                  <p>TEDxAshokaUniversity is a platform through which we aim to unleash new ideas, inspire and inform. The objective is to promote powerful story-telling, cross-disciplinary interactions, and untapped talents who have the aptitude to create and inspire change. Established in 2015, TEDxAshokaUniversity embodies the passion and spirit of the university.</p>
                                                                                </div>
                                                                              </mj-raw>
                                                                            </div>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                          <!--[if mso | IE]></td></tr></table><![endif]-->
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                                <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                                <div style="margin:0px auto;max-width:600px;">
                                                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                                                    <tbody>
                                                      <tr>
                                                        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                                                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                                                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                              <tbody>
                                                                <tr>
                                                                  <td style="vertical-align:top;padding:25px;">
                                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                                                      <tbody>
                                                                        <tr>
                                                                          <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                                                                            <div style="font-family:Lato, system-ui, sans-serif;font-size:13px;line-height:1;text-align:left;color:#eeeeee;">
                                                                              <p class="subscription-details"> You can adjust your <a href="http://post.spmailtechnolo.com/f/a/U7L1NdjGJZsdDZuk_ic1OA~~/AABEfgA~/RgRlRAoyP0QpaHR0cHM6Ly9jb2RlcGVuLmlvL3NldHRpbmdzL25vdGlmaWNhdGlvbnNXA3NwY0IKY09JhWFjGyNWbFISaWJiYTIwMDRAZ21haWwuY29tWAQAAAAA"> email preferences </a> any time, or <a href="http://post.spmailtechnolo.com/f/a/ShrRuuvCpOeOyn7F1ZuuHA~~/AABEfgA~/RgRlRAoyP0S1aHR0cHM6Ly9jb2RlcGVuLmlvL3NldHRpbmdzL25vdGlmaWNhdGlvbnMvb3B0b3V0P191bj1MU2hpM3NGUjR1aTdseFRDJTJGOHVqc01EU0QyQkRGUVZGZG8xdkZKZEQ5YTFQdWlIU1BHM1Q1Rnp6UEhqSTczNTVoWlhoM1pNNzIlMkJYcXgxMFclMkZTOGFQMUI4OXRjbyUyQmk0Y0NUNm5PSDExTUJJckRDdFk2cUU1ZjN2Y1cDc3BjQgpjT0mFYWMbI1ZsUhJpYmJhMjAwNEBnbWFpbC5jb21YBAAAAAA~"> instantly opt out </a> of emails of this kind. Need help with anything? Hit up <a href="http://post.spmailtechnolo.com/f/a/asTq9-lJErVS_19BYS_BUg~~/AABEfgA~/RgRlRAoyP0QaaHR0cHM6Ly9jb2RlcGVuLmlvL3N1cHBvcnRXA3NwY0IKY09JhWFjGyNWbFISaWJiYTIwMDRAZ21haWwuY29tWAQAAAAA">support</a>. </p>
                                                                            </div>
                                                                          </td>
                                                                        </tr>
                                                                      </tbody>
                                                                    </table>
                                                                  </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                          <!--[if mso | IE]></td><![endif]-->
                                                          <div class="footer-bar"></div>
                                                          <!--[if mso | IE]></tr></table><![endif]-->
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                                <!--[if mso | IE]></td></tr></table><![endif]-->
                                              </div>
                                            
                                            <img border="0" width="1" height="1" alt="" src="http://post.spmailtechnolo.com/q/xPzqNlzKXWaxqI139ruL4A~~/AABEfgA~/RgRlRAoyPlcDc3BjQgpjT0mFYWMbI1ZsUhJpYmJhMjAwNEBnbWFpbC5jb21YBAAAAAA~">
                                            </body>
                                            
                                            </html>`
                                        };
                                        mailTransporter.sendMail(mailDetails, function(err, data) {
                                            if(err) {
                                                console.log(err);
                                            } else {
                                                console.log('Email sent successfully');
                                            }
                                        });
                                    }
                                });
                            }else{
                                res.status(403).send("Incorrect OTP")                            }
                        }else{
                            console.log(err);
                        }
                    });
                }
            }else{
                res.status(400).send("Request an OTP first! Please take note: it expires in 3 minutes.")           
            }
        }else{
            console.log(err);
        }
    });
});


app.get("/register",function(req,res){
    Registrations.find({confirmed:true},function(err,docs){
        if(docs.length<401){
            res.render("eregister",{shut:false});
        }else{
            res.render("eregister",{shut:true});
        }
    })
    // res.render("registration");
});

app.get("/email/tedx",function(req,res){
    res.sendFile(__dirname+"/TEDxAshokaUni.png");
});

app.get("/email/subway",function(req,res){
    res.sendFile(__dirname+"/subway.png");
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