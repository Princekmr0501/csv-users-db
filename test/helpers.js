const fs = require("node:fs")
const path = require("node:path")

const repoRoot = path.resolve(__dirname, "..")
const dbPath = path.join(repoRoot, "db.js")
const usersCsvPath = path.join(repoRoot, "users.csv")

function deleteUsersCsvIfExists() {
  if (fs.existsSync(usersCsvPath)) {
    fs.unlinkSync(usersCsvPath)
  }
}

function readUsersCsvText() {
  return fs.readFileSync(usersCsvPath, "utf8")
}

function readUsersCsvLines() {
  const text = readUsersCsvText()
  return text.split(/\r?\n/).filter((l) => l.length > 0)
}

function parseUsersCsv() {
  const lines = readUsersCsvLines()
  if (lines.length === 0) {
    return { header: null, rows: [] }
  }
  const header = lines[0]
  const rows = lines.slice(1).map((line) => {
    const [id, name, email, age] = line.split(",")
    return {
      id: Number(id),
      name,
      email,
      age: Number(age),
      _raw: line,
    }
  })
  return { header, rows }
}

function captureConsoleLogs(fn) {
  const originalLog = console.log
  const originalError = console.error
  const logs = []
  const errors = []

  console.log = (...args) => {
    logs.push(args.map(String).join(" "))
  }
  console.error = (...args) => {
    errors.push(args.map(String).join(" "))
  }

  try {
    const result = fn()
    return { result, logs, errors }
  } finally {
    console.log = originalLog
    console.error = originalError
  }
}

function clearRequireCacheForDb() {
  const resolved = require.resolve(dbPath)
  delete require.cache[resolved]
}

function runDbInProcess(args) {
  if (!Array.isArray(args)) throw new Error("runDbInProcess(args): args must be an array")

  const originalArgv = process.argv
  const originalCwd = process.cwd()

  const argv = ["node", "db.js", ...args]

  let threw = false
  let error = null
  const { logs, errors, result } = captureConsoleLogs(() => {
    process.chdir(repoRoot)
    process.argv = argv
    clearRequireCacheForDb()
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(dbPath)
    } catch (e) {
      threw = true
      error = e
      return undefined
    }
  })

  // restore process globals
  process.argv = originalArgv
  process.chdir(originalCwd)

  return {
    argv,
    logs,
    errors,
    result,
    threw,
    error,
  }
}

module.exports = {
  repoRoot,
  dbPath,
  usersCsvPath,
  deleteUsersCsvIfExists,
  readUsersCsvText,
  readUsersCsvLines,
  parseUsersCsv,
  runDbInProcess,
}
