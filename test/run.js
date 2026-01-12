const fs = require("node:fs")
const path = require("node:path")

const { runAll } = require("./tinytest")

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      files.push(...walk(full))
    } else if (ent.isFile()) {
      files.push(full)
    }
  }
  return files
}

function isTestFile(filePath) {
  return filePath.endsWith(".test.js")
}

function loadTestFiles() {
  const testDir = path.resolve(__dirname)
  const all = walk(testDir)
  const testFiles = all.filter(isTestFile).sort()
  if (testFiles.length === 0) {
    process.stdout.write("No test files found.\n")
    process.exitCode = 1
    return
  }

  for (const f of testFiles) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(f)
  }
}

loadTestFiles()
runAll()

