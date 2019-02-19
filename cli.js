#! /usr/bin/env/node

var fs      = require("fs")
var path    = require("path")
var Mercury = require("@postlight/mercury-parser")
var markov  = require("markov")
var argv    = require("yargs-parser")(process.argv.slice(2), { string: true })

var m    = markov(2)
var urls = argv._;

function writeDb(corpus) {
  m.seed(corpus, () => {
    fs.writeFileSync(path.join(__dirname, 'functions/generate/db.json'), JSON.stringify(m.getDb()))
  })
}

Promise.all(urls.map(u => {
  return Mercury.parse(u, {contentType: 'text'}).then(result => {
    return result.content.trim()
  })
})).then(res => { writeDb(res.join('\n')) })

return true
