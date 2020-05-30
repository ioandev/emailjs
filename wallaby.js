module.exports = () => ({
    files: [
        'src/*.js',
    ],
    tests: [
        'src/*.test.js'
    ],
    reportConsoleErrorAsError: true,
    lowCoverageThreshold: 99,
    runAllTestsInAffectedTestFile: true,
    debug: true,
        env: {
            type: 'node',
            runner: 'node'
        },
compilers: {
    "**/*.js?(x)": wallaby.compilers.babel()
},
        testFramework: 'jest'
})
