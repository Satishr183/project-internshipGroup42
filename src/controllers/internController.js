const internModel = require('../model/internModel')
const collegeModel = require('../model/collegeModel')
const validator = require ("validator")





const createIntern = async function (req,res) {
    try {
        const internData = req.body
        const { name, mobile, email, collegeName} = internData

 //--------------------match the fields---------------------------
        let comp =["name", "mobile", "email", "collegeName", "isDeleted"]
        if(!Object.keys(internData).every(ele=>comp.includes(ele)))
        return res.status(400).send({status:false, message:'Invalid fields in Intern'})

 //--------------query not allowed validation-------------------------
        if (Object.keys(req.query) != 0) {
                return res.status(400).send({ status: false, message: "Do not provide any filter !!" })
        }

        if (Object.keys(internData).length < 1){
        return res.status (400).send({status : false, message : "Bad request"})
        }

//------------------intern name validation---------------
        if (!name){
        return res.status (400).send({status: false, message : "required name"})
        }
        
        if (!(/^[a-zA-Z ]{3,}$/).test(name))
        return res.status(400).send({status:false, message:'Only alphabets in name!!'})

//------------------intern CollegeName validation---------------
        if (!collegeName){
        return res.status (400).send({status: false, message : "required collegeName"})
        }
        
        if (!(/^[a-zA-Z]{3,5}$/).test(internData.collegeName))
        return res.status(400).send({status:false, message:'Only alphabets in collegeName and length between (3-5)'})


// -----------------for email validation------------------
        if (!email){
        return res.status (400).send({status : false, message: "required email"})
        }

        if (!validator.isEmail(email.trim())){
        return res.status(400).send({status : false, message : "required valid email"})
        }

        const findEmail = await internModel.find({email : email})

        if (findEmail.length > 0){
        return res.status(400).send({status : false, message :"email is aldready taken"})
        }
        
// --------------------for phone validation----------------
        if (!mobile){
        return res.status(400).send({status : false, message : "required mobile Number"})
        }
        
        if (!(/^[0-9]{10}$/).test(mobile)){
        return res.status(400).send({status : false, message : "mobile number is invalid"})
        }

        const findMobile = await internModel.find({mobile : mobile})
       
        if (findMobile.length > 0){
        return res.status(400).send({status : false, message :"mobile Number is aldready taken"})
        }

//---------------------creating Intern-----------------------------------------
        
        let collegeDetails = await collegeModel.findOne({name:collegeName})
        if (!collegeDetails || collegeDetails.isDeleted == true){
                return res.status(400).send({staus : false, message : "collage not found"})
        }
        

        let collegeId = collegeDetails._id.toString()

        let newData ={name,mobile,email,collegeId}
        const newIntern = await internModel.create(newData)
        
        return res.status(201).send({status:true, message:"internship successfully created", data:newIntern})
        
    }
    catch(err) {
        return res.status(500).send({status: false, message:"Error" ,error:err.message})
    }
}


const geDetails = async function(req, res){
    try{    
        let name = req.query.name

//---------------validation for name(collgeName abberiviation)----------------------------
        let query = req.query    
        let comp = ['name']
//-----------------------using query params validation---------------------------
       if(!Object.keys(query).every(ele=>comp.includes(ele)))
        return res.status(400).send({status : false, message : "wrong query given"})

        if (!name){
        return res.status(400).send({status : false, message : "name is required"})
        }
        
        if (!name.trim() || !(/^[a-zA-Z]{3,}$/).test(name)){
        return res.status(400).send({status : false, message : "Enter valid abbreviation"})
        }

        //-----if college name not found--------
        let collegeData = await collegeModel.findOne({name:name})
        
        let collegeName =collegeData

        if(!collegeName){
        return res.status(400).send({status : false, message : "college name not found"})
        }


//-----------------fetching all details of college-intern----------------------------------

        let internData =await internModel.find({collegeId:collegeName, isDeleted: false}).select({name:1,email:1,mobile:1})
        // -----------------if no interns found--------------------------------------------
        if (internData.length == 0) {
        return res.status(400).send({ status: false, message: "No intern found in this college !!" })
        }
        
        res.status(200).send({staus:true, name:collegeData.name,fullName:collegeData.fullName,logoLink:collegeData.logoLink,interns:internData})
        
        }
        catch(err){
        return res.status(500).send({status:false, message:'Error', error:err.message})
        }
    }
    
    
    module.exports.geDetails=geDetails
    module.exports.createIntern=createIntern