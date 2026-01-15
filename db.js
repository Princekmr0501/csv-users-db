
// checking if the file exists and if not initialize the file with header
function main() {
    const fs = require("fs")
    if (!fs.existsSync("users.csv")) {
        fs.writeFileSync("users.csv", `id,name,email,age\n`)
    }

    // ==========================================
    // CONVERTING THE DATA FROM STRING TO ARRAYS
    // ==========================================
    // fetching data from csv file
    const CsvData = fs.readFileSync("users.csv", "utf-8")
    // converting the csv data inside 1 whole array and splitting them line by line
    const lines = CsvData.trim().split("\n").slice(1)
    // Now converting single lines to array
    const users = lines.map(line=>{
        const [id, name, email, age] = line.split(",")
        // converting one csv row  into javascript objects
        return { id: Number(id), name, email, age: Number(age) }
    })

    // ==========================================
    //  ADD COMMAND
    // ==========================================
    // generating a new Id
    function newId(userList) {
        if (userList.length === 0) {return 1}
        return userList[userList.length - 1].id + 1
    }
    // Main add function starts here
    const command = process.argv[2]

    switch (command) {
    case 'new':
        fs.writeFileSync("users.csv", `id,name,email,age\n`)
        break

    case 'add': {
        const name = process.argv[3]
        const email = process.argv[4]
        const age = Number(process.argv[5])

        if (!name || !email || isNaN(age) || age < 0) {
            console.log("enter a valid argument")
            break
        }
        // checking if email exists
        // .some can only act on arrays so converting csvdata into arrays
        const emailExists = users.some(u=>u.email === email)
        if (emailExists) {
            console.log("email exists ")
            break
        }
        const newuser = `${newId(users)},${name},${email},${age}\n`
        fs.appendFileSync("users.csv", newuser)
        console.log("user added successfullly")
        break
    }

    // ==========================================
    //  LIST COMMAND
    // ==========================================
    case  'list':
        for (const u of users) {
            console.log(`${u.id} | ${u.name} | ${u.email} | ${u.age}`)
        }
        break

        // ==========================================
        //  DELETE COMMAND
        // ==========================================
    case 'delete': {
        // TAKING THE ID TO BE DELETED AND CHECKING IF THE ID IS A VALID NUMBER
        const Target = Number(process.argv[3])
        if (isNaN(Target)) {
            console.log("enter a valid number")
            break
        }

        // FINDING THE ID AND DELETING THE ID
        const after_del_users =  users.filter(u=>u.id !== Target)
        if (users.length === after_del_users.length) {
            console.log("user not found")
            break
        }
        // JOINING ALL THE ARRAY ROWS AND ADDING THE HEADER
        const strings = `id,name,email,age\n` + after_del_users.map(u=>`${u.id},${u.name},${u.email},${u.age}`).join("\n")
        // WRITING BACK TO THE CSV FILE
        fs.writeFileSync("users.csv", strings)
        console.log("user" + Number(process.argv[3]) + "deletd succcesfully")
        break
    }
    // ==========================================
    //  FIND COMMNAD
    // ==========================================
    case 'find': {
        const field = process.argv[3]
        // CHOOSING THE FIELD
        const allowedFields = ["id", "email"]
        if (!allowedFields.includes(field)) {
            console.log("Invalid Field")
            break
        }

        switch (field) {
        case 'id':
        {
            const upd_id = Number(process.argv[4])
            const id_match = users.find(u=>u.id === upd_id)
            if (id_match) {
                console.log(`${id_match.id} | ${id_match.name} | ${id_match.email} | ${id_match.age}`)
            } else {
                console.log("Not found")

            }
            break
        }
        // FINDING THE SPECIFIC TERM IN THE SPECIFIC FIELD

        case 'email': {
            const upd_email = process.argv[4]
            const email_match = users.find(u=>u.email === upd_email)
            if (email_match) {
                console.log(`${email_match.id} | ${email_match.name} | ${email_match.email} | ${email_match.age}`)
            } else {
                console.log("Not found" )
            }
            break
        }

        default:
            console.log("Invalid Field")
            break
        }
        break
    }
    // ==========================================
    //  UPDATE COMMNAD
    // ==========================================
    case 'update':
    {
    // FINDING THE ID AND CHECKING IF ID IS PRESENT
        const id_find = Number(process.argv[3])

        const id_found = users.find(u=>u.id === id_find)

        if (!id_found) {
            console.log("user not found")
            break
        }
        // IF ID EXISTS ,CHOOSE THE FIELD TO BE UPDATED AND UPDATE
        const field_1 = process.argv[4]
        const allowed_fields = ["name", "age", "email"]
        if (!allowed_fields.includes(field_1)) {
            console.log("Invalid Field")
            break
        }
        switch (field_1) {

        case 'name': {
            const upd_name = process.argv[5]
            if (!upd_name) {
                console.log("Invalid name ")
                break
            }
            id_found.name = upd_name
            console.log("updated successfully")
            break
        }

        case 'email': {
            const upd_email = process.argv[5]?.trim()
            // Check if email already exists for another user
            if (!upd_email) {
                console.log("Invalid email")
                return
            }

            const email_exists = users.some(u => u.email === upd_email && u.id !== id_find)
            if (email_exists) {
                console.log("Email already exists")
                return
            }
            id_found.email = upd_email
            console.log("updated successfully")
            break
        }

        case  'age': {
            const upd_age = Number(process.argv[5])
            if (isNaN(upd_age) || upd_age < 0) {
                console.log("Invalid Age")
                break
            }
            id_found.age = upd_age
            break
        }
        default:
            console.log("Invalid command")
            break
        }

        // NOW JOIN THE ARRAY ROWS (LINES) ALONG WITH THE HEADER
        const updated_users = `id,name,email,age\n` + users.map(u=>`${u.id},${u.name},${u.email},${u.age}`).join("\n")
        // NOW REWRITE THE FILE BACK
        fs.writeFileSync("users.csv", updated_users)
        // console.log(`user ${id_find} updated successfully`)
        break
    }
    default:
        console.log("Invalid command")
        break
    }
}
main()
