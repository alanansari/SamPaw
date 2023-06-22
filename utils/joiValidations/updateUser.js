const Joi = require('joi');

Joi.objectId = require('joi-objectid')(Joi)
 
const schema = Joi.object({
  id: Joi.objectId().required(),
  name: Joi.string().max(100),
  gender: Joi.string().valid('MALE','FEMALE','OTHERS'),
  student_no:Joi.number(),
  course: Joi.string().valid('BTECH','BCA','MCA'),
  year: Joi.number().min(1).max(4),
  branch : Joi.string().valid('CSE','CS','CSIT','IT','AIML','CSE-AIML','CSE-DS','EN','MECH','CIVIL','ECE','CSE-HINDI'),
  POR: Joi.string().valid('BH1','BH2','BH3','GH1','GH2','GH3','DAYSCHOLAR'),
  email: Joi.string().email({minDomainSegments : 3,maxDomainSegments:3 , tlds: { allow: ['in'] }}),
  password: Joi.string().regex( /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@#$!%*?&]{8,}$/),
  phone_no: Joi.string().length(10),

})

module.exports = schema;


// const ahu = async () =>{
// try {
//     const value = await schema.validateAsync({
//         id: '644b87b196a592cc8a5ec4c3',
//         name:'alu',
//         gender:'OTHERS',
//         year:4,
//         email:'cheeku67@gmail.ac.in',
//         password:"Qwerty@123",
//         phone_no: '0000000000'
//     });
//     console.log(1, value);
// }
// catch (err) {
//     console.log(2, err);
//  }

// }

// ahu();