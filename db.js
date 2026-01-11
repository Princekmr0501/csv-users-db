
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
//converting one csv row  into javascript objects 
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
case 'new' :
const newfile=process.argv[2];
fs.writeFileSync("users.csv",`id,name,email,age\n`);
break;

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

case 'delete' : 
      const Target =Number(process.argv[3]);
      if(isNaN(Target)){
        console.log("enter a valid number");
        break;
      }
    const after_del_users=  users.filter(u=>u.id!==Target);
    if(users.length==after_del_users.length){
        console.log("user not found");
        break;
    }
    
    //converting the arrays back to string,join the lines and the header.
   const strings=`id,name,email,age\n`+ after_del_users.map(u=>`${u.id},${u.name},${u.email},${u.age}`).join("\n");

     //now rewriting the file back 
     fs.writeFileSync("users.csv",strings);
     console.log("user" + Number(process.argv[3]) + "deletd succcesfully");
     break;

    case 'find' :
    const field =process.argv[3];
    switch (field){
    case 'id' :
        const upd_id=Number(process.argv[4]);
        const id_match=users.some(u=>u.id==upd_id);
        if(id_match){
           console.log(`Id found ID:${id_match.id}`);
        }
        break;
     case 'name' :
        const upd_name =process.argv[4];
        const name_match=users.find(u=>u.name===upd_name);
        if(name_match){
            console.log(`Name found ID:${name_match.id}` )
        }
        else{
             console.log("Not found " )
        }
     break;
     case 'email':
        const upd_email =process.argv[4];
        const email_match=users.find(u=>u.email===upd_email);
        if(email_match){
             console.log(`Email found ID:${email_match.id}`)
        }
        else{
             console.log("Not found " )
        }
        break;
     case  'age':
        const upd_age =Number(process.argv[4]);
        const age_match=users.some(u=>u.age==upd_age);
        if(age_match){
            console.log(`Age Found ID:${age_match.id}`)
        }
           break;

    }
case 'update' :
    const id_find=Number(process.argv[3]);
    const id_found=users.find(u=>u.id===id_find);
   
    if (!id_found) {
        console.log("User not found");
        break;
    }
    const field_1 =process.argv[4];
    switch (field_1){
    case 'id' :
        const upd_id=Number(process.argv[5]);
         id_found.id=upd_id;
         break;
     case 'name' :
        const upd_name=process.argv[5];
        id_found.name=upd_name;
        console.log("updated successfully")
        break;
     case 'email':
       const  upd_email=process.argv[5];
       id_found.email=upd_email;
       break;
     case  'age':
      const upd_age=Number(process.argv[5]);
        id_found.age=upd_age;
        break;

    }

const updated_users =`id,name,email,age\n`+ users.map(u=>`${u.id},${u.name},${u.email},${u.age}`).join("\n");

     //now rewriting the file back 
     fs.writeFileSync("users.csv",updated_users);
     console.log("user" + Number(process.argv[3]) + "updated succcesfully");
     break;


}

//updating  the values
//make a switch case for the fields and then find the particular value in the field and then replace it 


      
