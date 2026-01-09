const fs =require("fs");
if(!fs.existsSync("users.csv")){
    fs.writeFileSync("users.csv","id,name,email,age\n");
}else{
    console.log("File loaded!\nready to go ")
}
const users = [
  { id: 1, email: "a@mail.com", age: 20 },
  { id: 2, email: "b@mail.com", age: 25 }
];
//id,email and age must be  number, unique and a number respectively
const id =Number(process.argv[2]);
const email=process.argv[3];
const age = Number(process.argv[4]);

if(isNaN(id)){
    console.log("enter a valid id ");
    return;
}
if(isNaN(age)||age<0){
    console.log("enter a valid age ");
    return;
}
const emailExists=users.some(u=>u.email===email);
if(emailExists){
    console.log("email exists ");
    return;
}

//spliting  the lines 
//slicing the header from rest of the data
//counting the length
//if count ===0  its  a valid database 
   
