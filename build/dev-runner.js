/**
 * Runs both the express dev server and the electron client with
 * a single command. When one process exits, all processes exit.
 * Stdout and stderr from both processes is logged to the same console.
 */
var exec = require('child_process').exec
var config = require('../config')

var YELLOW = '\x1b[33m'
var BLUE = '\x1b[34m'
var END = '\x1b[0m'

function format (command, data, color) {
  return color + command + END +
    '  ' + // Two space offset
    data.trim().replace(/\n/g, '\n' + repeat(' ', command.length + 2)) +
    '\n'
}

function repeat (str, times) {
  return (new Array(times + 1)).join(str)
}

var children = []

function run (command, color) {
  var child = exec(command)

  child.stdout.on('data', function (data) {
    console.log(format(command.split(' ')[2], data, color))
  })

  child.stderr.on('data', function (data) {
    console.error(format(command.split(' ')[2], data, color))
  })

  child.on('exit', function (code) {
    exit(code)
  })

  children.push(child)
}

function exit (code) {
  children.forEach(function (child) {
    child.kill()
  })
  process.exit(code)
}

// Run the client and the server
run('npm run dev:server', YELLOW)
run('npm run dev:client -- ' + config.build.outputRoot, BLUE)
