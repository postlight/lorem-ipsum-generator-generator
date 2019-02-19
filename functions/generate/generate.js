var path = require("path")
var fs = require("fs")
var markov = require("markov")
var m = markov()
var db = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, 'db.json'), 'utf8'
  )
)

exports.handler = function(event, context, callback) {
  m.setDb(db);
  function graf (words) {
    var length = (words / 2) || 50
    var chain = m.fill(m.pick(), length)
    return chain
      .join(" ")
      .split(".")
      .map(s => s.trim())
      .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
      .join(". ")
      .concat(".")
  }

  var grafs = []

  if (event.queryStringParameters.paragraphs) {
    for (var i = 0; i < event.queryStringParameters.paragraphs; i++) {
      grafs.push(graf())
    }
  } else {
    grafs.push(graf(event.queryStringParameters.words))
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({paragraphs: grafs})
  })
}

