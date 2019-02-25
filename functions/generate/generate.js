var path = require("path")
var markov = require("markov")
var m = markov()
var db = require(path.resolve(process.cwd(), 'db.json'))
m.setDb(db);

exports.handler = function(event, _, callback) {
  function graf (words) {
    var length = (words / 2) || 50
    var chain = m.fill(m.pick(), length)
    return chain
      .join(" ")
      .split(".")
      .map(s => {
        s = s.trim()
        return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`
      })
      .join(" ")
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

