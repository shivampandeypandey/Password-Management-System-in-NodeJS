var express = require('express');
var router = express.Router();
var userModule=require('../modules/users');
var bcrypt=require('bcryptjs');
var jwt=require('jsonwebtoken');
  var passcatModel=require('../modules/password_category');
  var passModel=require('../modules/add_password');
var getpasscat=passcatModel.find({});
var getAllPass=passModel.find({});
const { check, validationResult } = require('express-validator');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkLoginUser(req,res,next)
{
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}

function checkEmail(req,res,next)
{
  var email=req.body.email;
  var checkexistemail=userModule.findOne({email:email});
  checkexistemail.exec((err,data)=>{
    if(err) throw err;
     if(data)
     {

     
    return res.render('signup', { title: 'Password Management System',msg:'Email Already Exist !'});

     }
     next();

  });



}

function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModule.findOne({username:uname});
  checkexitemail.exec((err,data)=>{
  if(err) throw err;
   if(data){
  
return res.render('signup', { title: 'Password Management System', msg:'Username Already Exit' });

 }
 next();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser)
  {
    res.redirect('./dashboard');
  }
  else{
    res.render('index', { title: 'Password Management System',msg:'' });

  }
 
});

router.post('/', function(req, res, next) {
  var username=req.body.uname;
  var password=req.body.password;

  var checkUser=userModule.findOne({username:username});
  checkUser.exec((err,data)=>{
    console.log(data);
    if(err) throw err;
    var getPassword=data.password;
    c                       
    var getUserId=data._id;


    if(bcrypt.compareSync(password,getPassword))
    {
      var token=jwt.sign({userId:getUserId},'loginToken');
      localStorage.setItem('userToken',token);
      localStorage.setItem('loginUser',username);

      res.redirect('/dashboard');
    }
    else{
      res.render('index', { title: 'Password Management System',msg:'Invalid Password !!' });
    }
  });

    
  
});
router.get('/dashboard', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  res.render('dashboard', { title: 'Password Management System',loginUser:loginUser});
});


router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Password Management System',msg:''});
});

router.post('/signup',checkUsername,checkEmail ,function(req, res, next) {

   var username=req.body.uname;
   var email=req.body.email;
   var password=req.body.password;
   var confpassword=req.body.confpassword;

   if(password != confpassword)
   {
      return res.render('signup',{title:'Password Manegent system', msg:'Password does not match !'});
   }
   else{

   
    password=bcrypt.hashSync(req.body.password,10);
   var userDetails=new userModule({
     username:username,
     email:email,
     password:password
   });
   userDetails.save((err,doc)=>{
     if(err) throw err;
    
         
     res.render('signup', { title: 'Password Management System' ,msg:'User registered successfuly !' });

   });
  }



  
});

router.get('/passwordCategory', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  getpasscat.exec(function(err,data){
    if(err) throw err;

    res.render('password-category', { title: 'Password Category',loginUser:loginUser,errors:'', success:'',records:data });

  });
});


router.get('/passwordCategory/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var passdelete=passcatModel.findByIdAndDelete(passcat_id);
  passdelete.exec(function(err){
    if(err) throw err;

    res.redirect('/passwordCategory');

  });
});
router.get('/passwordCategory/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.params.id;
  var getpassCategory=passcatModel.findById(passcat_id);
  getpassCategory.exec(function(err,data){
    if(err) throw err;

    res.render('edit_pass_category', { title: 'Password Category',loginUser:loginUser,errors:'', success:'',records:data,id:passcat_id });

  });
});

router.post('/passwordCategory/edit',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var passcat_id=req.body.id;
  var passwordCategory=req.body.passwordCategory;
  var update_passcat=passcatModel.findByIdAndUpdate(passcat_id,{password_category:passwordCategory});
  update_passcat.exec(function(err,data){
    if(err) throw err;

    res.redirect('/passwordCategory');

  });
});

router.get('/add-new-category', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  

    res.render('addNewCategory', { title: 'Password Category',loginUser:loginUser,errors:'', success:'' });

  
  
});


router.post('/add-new-category',checkLoginUser,[check('passwordCategory','Enter Password Category Name').isLength({ min: 2 })], function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    console.log(errors.mapped());
    res.render('addNewCategory', { title: 'Password Category',loginUser:loginUser ,errors:errors.mapped(),success:''});
  }
  else{
    var passcatname=req.body.passwordCategory;
    var passcatDetails=new passcatModel({
      password_category:passcatname, 
    });
    passcatDetails.save(function(err,doc){
      if(err) throw err;
      res.render('addNewCategory', { title: 'Password Category',loginUser:loginUser,errors:'',success:'Password Category Name Inserted Successfully !' });

    });

    
  }
  
 
});
router.get('/add-new-password', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  getpasscat.exec(function(err,data){
     if(err) throw err;

     res.render('add-new-password', { title: 'Password Category',loginUser:loginUser,records:data,success:'' });

  });
 
});

router.post('/add-new-password', checkLoginUser,function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
var pass_cat= req.body.pass_cat;
var project_name=req.body.project_name;
var pass_details= req.body.pass_details;
var password_details= new passModel({
password_category:pass_cat,
project_name:project_name,

password_detail:pass_details,
});
  
password_details.save(function(err,doc){
  if(err) throw err;
  getpasscat.exec(function(err,data){
    if(err) throw err;
  res.render('add-new-password', { title: 'Password Management System',loginUser: loginUser,records: data,success:"Password Details Inserted Successfully"});

});

  });
  });

router.get('/view-all-password', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  getAllPass.exec(function(err,data){
       if(err) throw err;
       res.render('view-all-password', { title: 'Password Category',loginUser:loginUser,records:data });

  })
 
});

router.get('/password_detail/delete/:id',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');

  var id=req.params.id;
  var delete_password=passModel.findByIdAndDelete(id);

  delete_password.exec(function(err){
       if(err) throw err;
      res.redirect('/view-all-password');

  });
 
});

router.get('/password_detail/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var id =req.params.id;
  var getPassDetails=passModel.findById({_id:id});
  getPassDetails.exec(function(err,data){
if(err) throw err;
getpasscat.exec(function(err,data1){
res.render('edit_password_detail', { title: 'Password Management System',loginUser: loginUser,records:data1,record:data,success:'' });
});
});
});

router.post('/password_detail/edit/:id',checkLoginUser, function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  var id =req.params.id;
  var passcat= req.body.pass_cat;
  var project_name= req.body.project_name;
  var pass_details= req.body.pass_details;
  passModel.findByIdAndUpdate(id,{password_category:passcat,project_name:project_name,password_detail:pass_details}).exec(function(err){
  if(err) throw err;
    var getPassDetails=passModel.findById({_id:id});
  getPassDetails.exec(function(err,data){
if(err) throw err;
getpasscat.exec(function(err,data1){
res.render('edit_password_detail', { title: 'Password Management System',loginUser: loginUser,records:data1,record:data,success:'Password Updated Successfully' });
});
});
});
});



router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

module.exports = router;
