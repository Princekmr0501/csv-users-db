const fs = require("node:fs")

const {
  usersCsvPath,
  deleteUsersCsvIfExists,
  readUsersCsvText,
  parseUsersCsv,
  runDbInProcess,
} = require("./helpers")

// NOTE: This suite is intentionally stateful (later tests depend on earlier ones).
// Keep `--runInBand` and keep tests in this file order.

function expectCsvHeader() {
  expect(fs.existsSync(usersCsvPath)).toBe(true)
  const { header } = parseUsersCsv()
  expect(header).toBe("id,name,email,age")
}

function expectUsers(expected) {
  const { rows } = parseUsersCsv()
  expect(rows).toHaveLength(expected.length)
  for (let i = 0; i < expected.length; i++) {
    const got = rows[i]
    const exp = expected[i]
    expect(got.id).toBe(exp.id)
    expect(got.name).toBe(exp.name)
    expect(got.email).toBe(exp.email)
    expect(got.age).toBe(exp.age)
    expect(Number.isNaN(got.id)).toBe(false)
    expect(Number.isNaN(got.age)).toBe(false)
  }
}

function expectListOutput(lines, expectedUsers) {
  const expectedLines = expectedUsers.map(
    (u) => `${u.id} | ${u.name} | ${u.email} | ${u.age}`
  )
  expect(lines).toEqual(expectedLines)
}

describe("db.js CLI (stateful)", () => {
  beforeAll(() => {
    // Per requirement: run tests in repo dir and delete users.csv before starting.
    deleteUsersCsvIfExists()
  })

  describe("Setup", () => {
    it("init: running with no command creates users.csv header and does not crash", () => {
      const res = runDbInProcess([])
      expect(res.threw).toBe(false)
      expectCsvHeader()

      // Ideal: header only on a fresh run
      const csv = readUsersCsvText()
      expect(csv).toMatch(/^id,name,email,age\r?\n?$/)
    })
  })

  describe("Create", () => {
    it("new: resets users.csv to header only", () => {
      const res = runDbInProcess(["new"])
      expect(res.threw).toBe(false)
      expectCsvHeader()

      const csv = readUsersCsvText()
      expect(csv).toMatch(/^id,name,email,age\r?\n?$/)
    })

    it("add (valid): adds first user with id=1 and persists", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["add", "John Doe", "john@email.com", "25"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/added/i)
      expect(readUsersCsvText()).not.toBe(before)

      expectCsvHeader()
      expectUsers([{ id: 1, name: "John Doe", email: "john@email.com", age: 25 }])
    })

    it("add (valid): adds second user with id=2", () => {
      const res = runDbInProcess(["add", "Alice", "alice@email.com", "30"])
      expect(res.threw).toBe(false)
      expectUsers([
        { id: 1, name: "John Doe", email: "john@email.com", age: 25 },
        { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
      ])
    })
  })

  describe("Read", () => {
    it("list (empty): prints nothing and does not crash", () => {
      // reset first
      runDbInProcess(["new"])
      const res = runDbInProcess(["list"])
      expect(res.threw).toBe(false)
      expect(res.logs).toHaveLength(0)
      expectCsvHeader()

      // restore state for later tests
      runDbInProcess(["add", "John Doe", "john@email.com", "25"])
      runDbInProcess(["add", "Alice", "alice@email.com", "30"])
    })

    it("list (non-empty): prints users in `id | name | email | age` format", () => {
      const res = runDbInProcess(["list"])
      expect(res.threw).toBe(false)
      expectListOutput(res.logs, [
        { id: 1, name: "John Doe", email: "john@email.com", age: 25 },
        { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
      ])
    })

    it("find (email): existing user prints the matching user", () => {
      const res = runDbInProcess(["find", "email", "john@email.com"])
      expect(res.threw).toBe(false)
      expect(res.logs).toHaveLength(1)
      expect(res.logs[0]).toBe("1 | John Doe | john@email.com | 25")
    })

    it("find (email): missing user prints `Not found`", () => {
      const res = runDbInProcess(["find", "email", "missing@email.com"])
      expect(res.threw).toBe(false)
      expect(res.logs).toHaveLength(1)
      expect(res.logs[0]).toBe("Not found")
    })

    it("find (id): existing user prints the matching user", () => {
      const res = runDbInProcess(["find", "id", "1"])
      expect(res.threw).toBe(false)
      expect(res.logs).toHaveLength(1)
      expect(res.logs[0]).toBe("1 | John Doe | john@email.com | 25")
    })

    it("find (id): missing user prints `Not found`", () => {
      const res = runDbInProcess(["find", "id", "999"])
      expect(res.threw).toBe(false)
      expect(res.logs).toHaveLength(1)
      expect(res.logs[0]).toBe("Not found")
    })
  })

  describe("Update", () => {
    it("update: updates one user field and keeps CSV valid", () => {
      const res = runDbInProcess(["update", "1", "age", "31"])
      expect(res.threw).toBe(false)

      expectCsvHeader()
      expectUsers([
        { id: 1, name: "John Doe", email: "john@email.com", age: 31 },
        { id: 2, name: "Alice", email: "alice@email.com", age: 30 },
      ])
    })

    it("update: missing id prints `User not found` and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["update", "999", "age", "40"])
      expect(res.threw).toBe(false)
      expect(res.logs.join("\n")).toMatch(/not found/i)
      expect(readUsersCsvText()).toBe(before)
    })
  })

  describe("Delete", () => {
    it("delete: deletes existing user and preserves others", () => {
      const res = runDbInProcess(["delete", "2"])
      expect(res.threw).toBe(false)

      expectCsvHeader()
      expectUsers([{ id: 1, name: "John Doe", email: "john@email.com", age: 31 }])
    })

    it("delete: missing id prints `user not found` and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["delete", "999"])
      expect(res.threw).toBe(false)
      expect(res.logs.join("\n")).toMatch(/not found/i)
      expect(readUsersCsvText()).toBe(before)
    })
  })

  describe("Errors", () => {
    it("add (validation): duplicate email is rejected and does not change file", () => {
      // recreate 2-user state for this block
      runDbInProcess(["new"])
      runDbInProcess(["add", "John Doe", "john@email.com", "25"])
      runDbInProcess(["add", "Alice", "alice@email.com", "30"])

      const before = readUsersCsvText()
      const res = runDbInProcess(["add", "Alice 2", "alice@email.com", "31"])
      expect(res.threw).toBe(false)
      expect(res.logs.join("\n")).toMatch(/email/i)
      expect(readUsersCsvText()).toBe(before)
    })

    it("add (validation): missing arguments is rejected and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["add", "Bob"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(readUsersCsvText()).toBe(before)
    })

    it("add (validation): non-numeric age is rejected and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["add", "Bob", "bob@email.com", "notanumber"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(readUsersCsvText()).toBe(before)
    })

    it("add (validation): negative age is rejected and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["add", "Bob", "bob2@email.com", "-1"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(readUsersCsvText()).toBe(before)
    })

    it("find (invalid field): prints a clear error message", () => {
      const res = runDbInProcess(["find", "name", "John Doe"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/invalid|field|allowed/i)
    })

    it("update: invalid field prints a clear error and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["update", "1", "id", "123"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/invalid|field|allowed/i)
      expect(readUsersCsvText()).toBe(before)
    })

    it("update: changing email to an existing email should be rejected", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["update", "1", "email", "alice@email.com"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/email|exists|unique|duplicate|invalid/i)
      expect(readUsersCsvText()).toBe(before)
    })

    it("delete: non-numeric id prints a validation error and does not change file", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["delete", "not-a-number"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/valid|number|id/i)
      expect(readUsersCsvText()).toBe(before)
    })

    it("unknown command: prints a clear error and does not corrupt the CSV", () => {
      const before = readUsersCsvText()
      const res = runDbInProcess(["unknown-command"])
      expect(res.threw).toBe(false)
      expect(res.logs.length).toBeGreaterThan(0)
      expect(res.logs.join("\n")).toMatch(/unknown|invalid|command/i)
      expect(readUsersCsvText()).toBe(before)
    })
  })

  describe("Cleanup", () => {
    it("reset file to header only (keeps repo tidy after tests)", () => {
      const res = runDbInProcess(["new"])
      expect(res.threw).toBe(false)
      const csv = readUsersCsvText()
      expect(csv).toMatch(/^id,name,email,age\r?\n?$/)
    })
  })
})

