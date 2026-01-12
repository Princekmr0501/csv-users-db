

# CSV Database Exercise

**Build a Command-Line Users Database using Node.js and CSV**

---

## Step 0: Create a GitHub Repository (Mandatory)

### Repository name (exact)

```
csv-users-db
```

### What you must do

1. Create a new GitHub repository with the exact name above
2. Make it public
3. Clone it to your local machine
4. Initialize it with a README file with steps to run the program
5. Add an Instructions.md file with this document

### Success criteria

* Repository exists on GitHub
* Local folder is cloned
* Git is tracking changes

---

## Project Overview

You will build a small command-line program that behaves like a very simple database.
The database will store user records inside a CSV file.

You will be able to:

* Create users
* List users
* Find users
* Update users
* Delete users

All data must persist inside a CSV file.

---

## Constraints (Important)

* Language: JavaScript (Node.js)
* No external libraries allowed
* Use only built-in Node.js modules
* Program must be runnable using `node`
* All data must be stored in a CSV file

---

## File Structure (Mandatory)

```
csv-users-db/
├── db.js
└── users.csv
```

---

## CSV Schema (Mandatory)

The CSV file must use the following columns in this exact order:

```
id,name,email,age
```

Rules:

* `id` must be a number
* `email` must be unique
* `age` must be a number

---

## How the Program is Run

The program must be executed like this:

```
node db.js <command> [arguments]
```

Examples:

```
node db.js list
node db.js add "John Doe" "john@email.com" 25
node db.js find email john@email.com
node db.js update 3 age 30
node db.js delete 2
```

---

## Step 1: Initialize the Database File

### What you must do

* When `db.js` runs, it must check if `users.csv` exists
* If it does not exist, create it with the header row only

### Expected CSV content

```
id,name,email,age
```

### Success criteria

* Running `node db.js` does not crash
* `users.csv` exists after running the script

---

## Step 2: Read the CSV File into Memory

### What you must do

* Read the entire CSV file
* Split it into lines
* Separate the header from the data rows

### Expected result

* You should have an array of rows representing users
* Header should not be treated as a user

### Success criteria

* You can log how many users exist
* No errors occur on empty database

---

## Step 3: Parse Rows into JavaScript Objects

### What you must do

Convert each row like:

```
1,John,john@email.com,25
```

Into:

```js
{
  id: 1,
  name: "John",
  email: "john@email.com",
  age: 25
}
```

### Rules

* Convert numbers properly
* Ignore empty lines

### Success criteria

* You have an array of user objects
* Data types are correct

---

## Step 4: Implement the `list` Command

### Command

```
node db.js list
```

### What it must do

* Print all users
* One user per line
* Show all fields

### Example output

```
1 | John | john@email.com | 25
2 | Alice | alice@email.com | 30
```

### Success criteria

* Works on empty database
* Works with multiple users

---

## Step 5: Implement the `add` Command

### Command

```
node db.js add "Name" "email" age
```

### What it must do

* Validate inputs
* Generate a new unique id
* Append user to CSV

### Validation rules

* Email must not already exist
* Age must be a number

### Expected CSV change

```
id,name,email,age
1,John,john@email.com,25
```

### Success criteria

* Data persists after program exits
* Invalid input does not corrupt the file

---

## Step 6: Implement the `find` Command

### Command

```
node db.js find <field> <value>
```

Allowed fields:

* `id`
* `email`

### What it must do

* Search users
* Print matching user or `Not found`

### Success criteria

* Finds existing users
* Gracefully handles missing users

---

## Step 7: Implement the `update` Command

### Command

```
node db.js update <id> <field> <newValue>
```

Allowed fields:

* `name`
* `email`
* `age`

### What it must do

* Locate user by id
* Validate new value
* Update in memory
* Rewrite entire CSV file

### Success criteria

* Only one user is updated
* CSV file remains valid

---

## Step 8: Implement the `delete` Command

### Command

```
node db.js delete <id>
```

### What it must do

* Remove the user from memory
* Rewrite the CSV file without that user

### Success criteria

* User is gone after deletion
* Other users remain untouched

---

## Step 9: Write Back to CSV Correctly

### What you must do

* Always rewrite the full file for update and delete
* Preserve header
* Ensure correct CSV formatting

### Success criteria

* File opens correctly in a text editor
* Script can still read the file after multiple operations

---

## Step 10: Handle Errors Gracefully

### Required error handling

* Unknown command
* Missing arguments
* Invalid field names
* Non-numeric ids or age

### Expected behavior

* Print a clear error message
* Do not crash
* Do not corrupt the CSV file

---

## Final Project Expectations

By the end, your program must:

* Act like a very small database
* Be usable entirely from the command line
* Persist data using a CSV file
* Support full CRUD operations
* Fail safely and predictably