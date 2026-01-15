const fs = require("node:fs")
const path = require("node:path")
const util = require("node:util")

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

function parseUsersCsv() {
    const text = readUsersCsvText()
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
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

function formatConsoleCall(args) {
    return util.format(...args)
}

function captureConsole(fn) {
    // Prefer Jest spies in Jest environment (works with Jest's custom console)
    if (typeof jest !== "undefined" && typeof jest.spyOn === "function") {
        const logs = []
        const errors = []

        const logSpy = jest.spyOn(console, "log").mockImplementation((...args) => {
            logs.push(formatConsoleCall(args))
        })
        const errSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
            errors.push(formatConsoleCall(args))
        })

        try {
            const result = fn()
            return { result, logs, errors }
        } finally {
            logSpy.mockRestore()
            errSpy.mockRestore()
        }
    }

    // Fallback for plain Node execution
    const originalLog = console.log
    const originalError = console.error
    const logs = []
    const errors = []

    console.log = (...args) => logs.push(formatConsoleCall(args))
    console.error = (...args) => errors.push(formatConsoleCall(args))

    try {
        const result = fn()
        return { result, logs, errors }
    } finally {
        console.log = originalLog
        console.error = originalError
    }
}

function runDbInProcess(args) {
    if (!Array.isArray(args)) {throw new Error("runDbInProcess(args): args must be an array")}

    const originalArgv = process.argv
    const originalCwd = process.cwd()

    const argv = ["node", "db.js", ...args]

    let threw = false
    let error = null
    const { logs, errors, result } = captureConsole(() => {
        process.chdir(repoRoot)
        process.argv = argv
        try {
            // Jest keeps its own module registry, so use isolateModules to re-run db.js each call.
            if (typeof jest !== "undefined" && typeof jest.isolateModules === "function") {
                let mod
                jest.isolateModules(() => {
                    // eslint-disable-next-line import/no-dynamic-require
                    mod = require(dbPath)
                })
                return mod
            }

            // Fallback for plain node execution (not Jest)
            const resolved = require.resolve(dbPath)
            delete require.cache[resolved]
            // eslint-disable-next-line import/no-dynamic-require
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
    parseUsersCsv,
    runDbInProcess,
}
