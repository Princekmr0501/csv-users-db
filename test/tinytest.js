const util = require("node:util")

class AssertionError extends Error {
  constructor(message) {
    super(message)
    this.name = "AssertionError"
  }
}

function formatValue(v) {
  return util.inspect(v, { depth: 10, colors: false, maxArrayLength: 50 })
}

const tests = []

function test(name, fn) {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("test(name, fn): name must be a non-empty string")
  }
  if (typeof fn !== "function") {
    throw new Error(`test("${name}", fn): fn must be a function`)
  }
  tests.push({ name, fn })
}

const assert = {
  ok(value, message) {
    if (!value) {
      throw new AssertionError(message ?? `Expected truthy, got ${formatValue(value)}`)
    }
  },
  equal(actual, expected, message) {
    if (!Object.is(actual, expected)) {
      throw new AssertionError(
        message ??
          `Expected:\n${formatValue(expected)}\nReceived:\n${formatValue(actual)}`
      )
    }
  },
  deepEqual(actual, expected, message) {
    if (!util.isDeepStrictEqual(actual, expected)) {
      throw new AssertionError(
        message ??
          `Expected (deep equal):\n${formatValue(expected)}\nReceived:\n${formatValue(actual)}`
      )
    }
  },
  match(actual, regex, message) {
    if (typeof actual !== "string") {
      throw new AssertionError(
        message ?? `assert.match expects a string, got ${typeof actual}`
      )
    }
    if (!(regex instanceof RegExp)) {
      throw new AssertionError(
        message ?? `assert.match expects a RegExp, got ${typeof regex}`
      )
    }
    if (!regex.test(actual)) {
      throw new AssertionError(
        message ?? `Expected string to match ${String(regex)}.\nReceived:\n${actual}`
      )
    }
  },
}

async function runAll() {
  const startedAt = Date.now()
  let passed = 0
  let failed = 0

  for (let i = 0; i < tests.length; i++) {
    const { name, fn } = tests[i]
    const idx = String(i + 1).padStart(2, "0")
    const t0 = Date.now()
    try {
      await fn()
      const dt = Date.now() - t0
      passed++
      process.stdout.write(`PASS ${idx} ${name} (${dt}ms)\n`)
    } catch (err) {
      const dt = Date.now() - t0
      failed++
      process.stdout.write(`FAIL ${idx} ${name} (${dt}ms)\n`)
      if (err && typeof err === "object") {
        process.stdout.write(`  ${err.name ?? "Error"}: ${err.message ?? String(err)}\n`)
        if (err.stack) {
          const stack = String(err.stack)
            .split("\n")
            .slice(1, 6)
            .join("\n")
          process.stdout.write(`  Stack (top):\n${stack}\n`)
        }
      } else {
        process.stdout.write(`  Error: ${String(err)}\n`)
      }
    }
  }

  const dt = Date.now() - startedAt
  process.stdout.write("\n")
  process.stdout.write(`Total: ${tests.length}, Passed: ${passed}, Failed: ${failed}, Time: ${dt}ms\n`)

  if (failed > 0) {
    process.exitCode = 1
  }
}

module.exports = { AssertionError, assert, test, runAll }
