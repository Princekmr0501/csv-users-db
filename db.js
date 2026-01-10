
//checking if the file exists and if not initialize the file with header 
const fs =require("fs");
if(!fs.existsSync("users.csv")){
    fs.writeFileSync("users.csv",`id,name,email,age\n`);
}else{
    console.log("File loaded!\nready to go ")
    }
//==========================================
// CONVERTING THE DATA FROM STRING TO ARRAYS 
//==========================================
//fetching data from csv file  
const CsvData=fs.readFileSync("users.csv","utf-8");
//converting the csv data inside 1 whole array and splitting them line by line 
const lines=CsvData.trim().split("\n").slice(1);
//Now converting single lines to array 
const users =lines.map(lines=>{
    const[id,name,email,age]=lines.split(",");
    return{id:Number(id) ,name,email,age:Number(age)};
})
//==========================================
//  ADD AND LIST COMMANDS
//==========================================
 //generating a new Id 
 function newId(users){
    if(users.length==0)return 1 ;
    return users[users.length-1].id+1;
}
//Main add function starts here 
const command =process.argv[2];
switch(command){
case 'add':
const name =process.argv[3];
const email=process.argv[4];
const age =Number(process.argv[5]);

 if(!name || !email || isNaN(age)||age<0){
     console.log("enter a valid age ");
     return;
 }
 //checking if email exists 
 //.some can only act on arrays so converting csvdata into arrays 
const emailExists=users.some(u=>u.email===email);
 if(emailExists){
     console.log("email exists ");
     return;
 }
    const newuser =`${newId(users)},${name},${email},${age}\n`;
    fs.appendFileSync("users.csv",newuser);
    console.log("user added successfullly");
     break;
// list command for displaying the data     
case  'list':
    for(let i=0;i<users.length;i++){
        console.log(users[i]);
    }
    break;
}
