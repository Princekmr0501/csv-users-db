
# CSV Users Database

A simple command-line users database built with Node.js and CSV.

## Requirements
- Node.js installed

## Setup
1. Clone the repository
2. Navigate to the project folder

```bash
git clone https://github.com/your-username/csv-users-db.git
cd csv-users-db
```
## INSTRUCTIONS TO RUN THE PROGRAM 

**`Commands`**
**Making a New File** 
  node db.js new

**Add a user**
* node db.js add "John Doe" "john@email.com" 25

**List users**
* node db.js list

**Delete a user**
* node db.js delete 1

**Find a user**
* node db.js find email john@email.com

**Update a user**
* node db.js update 1 age 30