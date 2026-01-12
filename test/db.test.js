const fs = require("node:fs")

const { assert, test } = require("./tinytest")
const {
  usersCsvPath,
  deleteUsersCsvIfExists,
  readUsersCsvText,
  parseUsersCsv,
  runDbInProcess,
} = require("./helpers")

// Per requirement: run tests in repo dir and delete users.csv before starting.
deleteUsersCsvIfExists()

function expectCsvHeader() {
  assert.ok(fs.existsSync(usersCsvPath), "`users.csv` should exist")
  const { header } = parseUsersCsv()
  assert.equal(header, "id,name,email,age", "CSV header must be exactly: id,name,email,age")
}

function expectUsers(expected) {
  const { rows } = parseUsersCsv()
  assert.equal(rows.length, expected.length, "Unexpected number of users in CSV")
  for (let i = 0; i < expected.length; i++) {
    const got = rows[i]
    const exp = expected[i]
    assert.equal(got.id, exp.id, `Row ${i + 1}: id mismatch`)
    assert.equal(got.name, exp.name, `Row ${i + 1}: name mismatch`)
    assert.equal(got.email, exp.email, `Row ${i + 1}: email mismatch`)
    assert.equal(got.age, exp.age, `Row ${i + 1}: age mismatch`)
    assert.ok(!Number.isNaN(got.id), `Row ${i + 1}: id must be a number`)
    assert.ok(!Number.isNaN(got.age), `Row ${i + 1}: age must be a number`)
  }
}

function expectListOutput(lines, expectedUsers) {
  const expectedLines = expectedUsers.map(
    (u) => `${u.id} | ${u.name} | ${u.email} | ${u.age}`
  )
  assert.deepEqual(
    lines,
    expectedLines,
    "list output should print one user per line in `id | name | email | age` format"
  )
}

test("init: running with no command creates users.csv header and does not crash", () => {
  const res = runDbInProcess([])
  assert.ok(!res.threw, `db.js should not throw. Error: ${res.error?.message ?? "none"}`)
  expectCsvHeader()

  // Ideal: header only on a fresh run
  const csv = readUsersCsvText()
  assert.match(csv, /^id,name,email,age\r?\n?$/, "Fresh DB should contain only the header row")
})

test("new: resets users.csv to header only", () => {
  const res = runDbInProcess(["new"])
  assert.ok(!res.threw, `db.js should not throw on 'new'. Error: ${res.error?.message ?? "none"}`)
  expectCsvHeader()

  const csv = readUsersCsvText()
  assert.match(csv, /^id,name,email,age\r?\n?$/, "`new` should reset file to header only")
})

test("list (empty): prints nothing and does not crash", () => {
  const res = runDbInProcess(["list"])
  assert.ok(!res.threw, `db.js should not throw on 'list'. Error: ${res.error?.message ?? "none"}`)
  assert.equal(res.logs.length, 0, "Empty list should produce no output lines")
  expectCsvHeader()
})

test("add (valid): adds first user with id=1 and persists", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["add", "John Doe", "john@email.com", "25"])
  assert.ok(!res.threw, `db.js should not throw on 'add'. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "add should print a success message")
  assert.match(res.logs.join("\n"), /added/i, "add should indicate success in output")
  assert.ok(readUsersCsvText() !== before, "CSV should change after adding a valid user")

  expectCsvHeader()
  expectUsers([{ id: 1, name: "John Doe", email: "john@email.com", age: 25 }])
})

test("add (valid): adds second user with id=2", () => {
  const res = runDbInProcess(["add", "Alice", "alice@email.com", "30"])
  assert.ok(!res.threw, `db.js should not throw on 'add'. Error: ${res.error?.message ?? "none"}`)
  expectUsers([
    { id: 1, name: "John Doe", email: "john@email.com", age: 25 },
    { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
  ])
})

test("list (non-empty): prints users in `id | name | email | age` format", () => {
  const res = runDbInProcess(["list"])
  assert.ok(!res.threw, `db.js should not throw on 'list'. Error: ${res.error?.message ?? "none"}`)
  expectListOutput(res.logs, [
    { id: 1, name: "John Doe", email: "john@email.com", age: 25 },
    { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
  ])
})

test("add (validation): duplicate email is rejected and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["add", "Alice 2", "alice@email.com", "31"])
  assert.ok(!res.threw, `db.js should not throw on invalid add. Error: ${res.error?.message ?? "none"}`)
  assert.match(res.logs.join("\n"), /email/i, "Should explain email is invalid/duplicate")
  assert.equal(readUsersCsvText(), before, "CSV should not change on duplicate email")
})

test("add (validation): missing arguments is rejected and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["add", "Bob"])
  assert.ok(!res.threw, `db.js should not throw on invalid add. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print a validation error")
  assert.equal(readUsersCsvText(), before, "CSV should not change on missing args")
})

test("add (validation): non-numeric age is rejected and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["add", "Bob", "bob@email.com", "notanumber"])
  assert.ok(!res.threw, `db.js should not throw on invalid add. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print a validation error")
  assert.equal(readUsersCsvText(), before, "CSV should not change on non-numeric age")
})

test("add (validation): negative age is rejected and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["add", "Bob", "bob2@email.com", "-1"])
  assert.ok(!res.threw, `db.js should not throw on invalid add. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print a validation error")
  assert.equal(readUsersCsvText(), before, "CSV should not change on negative age")
})

test("find (email): existing user prints the matching user", () => {
  const res = runDbInProcess(["find", "email", "john@email.com"])
  assert.ok(!res.threw, `db.js should not throw on 'find'. Error: ${res.error?.message ?? "none"}`)
  assert.equal(res.logs.length, 1, "find should print exactly one line")
  assert.equal(
    res.logs[0],
    "1 | John Doe | john@email.com | 25",
    "find should print the full user in the same format as list"
  )
})

test("find (email): missing user prints `Not found`", () => {
  const res = runDbInProcess(["find", "email", "missing@email.com"])
  assert.ok(!res.threw, `db.js should not throw on 'find'. Error: ${res.error?.message ?? "none"}`)
  assert.equal(res.logs.length, 1, "find should print exactly one line")
  assert.equal(res.logs[0], "Not found", "find should say Not found when no match exists")
})

test("find (id): existing user prints the matching user", () => {
  const res = runDbInProcess(["find", "id", "1"])
  assert.ok(!res.threw, `db.js should not throw on 'find'. Error: ${res.error?.message ?? "none"}`)
  assert.equal(res.logs.length, 1, "find should print exactly one line")
  assert.equal(
    res.logs[0],
    "1 | John Doe | john@email.com | 25",
    "find should print the full user in the same format as list"
  )
})

test("find (id): missing user prints `Not found`", () => {
  const res = runDbInProcess(["find", "id", "999"])
  assert.ok(!res.threw, `db.js should not throw on 'find'. Error: ${res.error?.message ?? "none"}`)
  assert.equal(res.logs.length, 1, "find should print exactly one line")
  assert.equal(res.logs[0], "Not found", "find should say Not found when no match exists")
})

test("find (invalid field): prints a clear error message", () => {
  const res = runDbInProcess(["find", "name", "John Doe"])
  assert.ok(!res.threw, `db.js should not throw on invalid field. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print an error for invalid field name")
  assert.match(res.logs.join("\n"), /invalid|field|allowed/i, "Error message should be clear")
})

test("update: updates one user field and keeps CSV valid", () => {
  const res = runDbInProcess(["update", "1", "age", "31"])
  assert.ok(!res.threw, `db.js should not throw on 'update'. Error: ${res.error?.message ?? "none"}`)

  expectCsvHeader()
  expectUsers([
    { id: 1, name: "John Doe", email: "john@email.com", age: 31 },
    { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
  ])
})

test("update: missing id prints `User not found` and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["update", "999", "age", "40"])
  assert.ok(!res.threw, `db.js should not throw on 'update'. Error: ${res.error?.message ?? "none"}`)
  assert.match(res.logs.join("\n"), /not found/i, "Should indicate missing user")
  assert.equal(readUsersCsvText(), before, "CSV should not change when updating missing user")
})

test("update: invalid field prints a clear error and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["update", "1", "id", "123"])
  assert.ok(!res.threw, `db.js should not throw on invalid update field. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print an error for invalid update field")
  assert.match(res.logs.join("\n"), /invalid|field|allowed/i, "Error message should be clear")
  assert.equal(readUsersCsvText(), before, "CSV should not change on invalid update field")
})

test("update: changing email to an existing email should be rejected", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["update", "1", "email", "alice@email.com"])
  assert.ok(!res.threw, `db.js should not throw on update. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print a validation error")
  assert.match(res.logs.join("\n"), /email|exists|unique|duplicate|invalid/i, "Should explain duplicate email")
  assert.equal(readUsersCsvText(), before, "CSV should not change when setting duplicate email")
})

test("delete: deletes existing user and preserves others", () => {
  const res = runDbInProcess(["delete", "2"])
  assert.ok(!res.threw, `db.js should not throw on 'delete'. Error: ${res.error?.message ?? "none"}`)

  expectCsvHeader()
  expectUsers([{ id: 1, name: "John Doe", email: "john@email.com", age: 31 }])
})

test("delete: missing id prints `user not found` and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["delete", "999"])
  assert.ok(!res.threw, `db.js should not throw on 'delete'. Error: ${res.error?.message ?? "none"}`)
  assert.match(res.logs.join("\n"), /not found/i, "Should indicate user not found")
  assert.equal(readUsersCsvText(), before, "CSV should not change when deleting missing user")
})

test("delete: non-numeric id prints a validation error and does not change file", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["delete", "not-a-number"])
  assert.ok(!res.threw, `db.js should not throw on 'delete'. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print a validation error")
  assert.match(res.logs.join("\n"), /valid|number|id/i, "Error message should be clear")
  assert.equal(readUsersCsvText(), before, "CSV should not change on invalid id")
})

test("unknown command: prints a clear error and does not corrupt the CSV", () => {
  const before = readUsersCsvText()
  const res = runDbInProcess(["unknown-command"])
  assert.ok(!res.threw, `db.js should not throw on unknown command. Error: ${res.error?.message ?? "none"}`)
  assert.ok(res.logs.length > 0, "Should print an error message for unknown commands")
  assert.match(res.logs.join("\n"), /unknown|invalid|command/i, "Unknown command error should be clear")
  assert.equal(readUsersCsvText(), before, "CSV should not change on unknown command")
})

test("cleanup: reset file to header only (keeps repo tidy after tests)", () => {
  const res = runDbInProcess(["new"])
  assert.ok(!res.threw, `db.js should not throw on 'new'. Error: ${res.error?.message ?? "none"}`)
  const csv = readUsersCsvText()
  assert.match(csv, /^id,name,email,age\r?\n?$/, "`new` should reset file to header only")
})

