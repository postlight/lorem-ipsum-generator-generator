#! /usr/bin/env/node

var fs      = require("fs")
var spawn   = require("cross-spawn")
var path    = require("path")
var Mercury = require("@postlight/mercury-parser")
var markov  = require("markov")
var slugify = require("slugify")
var argv    = require("yargs-parser")(process.argv.slice(2), { string: true })

if (!argv.name) {
  console.log("A project name is required.")
  process.exit()
}

var name = slugify(argv.name, {lower: true})
var root = path.resolve(name)
var m    = markov(2)
var urls = argv._

if (!fs.existsSync(root)){
  fs.mkdirSync(root);
}

fs.mkdirSync(path.join(root, 'functions'))
fs.mkdirSync(path.join(root, 'functions/generate'))

var files = [
  'netlify.toml',
  'postlight-labs.gif',
  'functions/generate/generate.js',
  'functions/generate/package.json'
]
files.forEach(f => fs.copyFileSync(path.join(__dirname, f), path.join(root, f)))

var packageJson = {
  name,
  version: '1.0.0',
  private: true,
  description: 'A lorem ipsum generator based on text found by Mercury Parser',
  scripts: {
    deploy: './node_modules/.bin/netlify deploy --prod --open --functions functions'
  },
  dependencies: {
    "netlify-cli": "2.7.0"
  }
}
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2))

Promise.all(urls.map(u => {
  return Mercury.parse(u, {contentType: 'text'}).then(result => {
    return result.content.trim()
  })
})).then(res => { writeDb(res.join('\n')) })

var index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
var updatedIndex = index.replace(/My Ipsum/g, argv.name)
if (argv.logo) {
  updatedIndex = updatedIndex.replace(/https://placekitten.com/300/300/g, argv.logo)
}
if (argv.background) {
  updatedIndex = updatedIndex.replace(/https://placekitten.com/800/600/g, argv.background)
}
if (argv.accent) {
  updatedIndex = updatedIndex.replace(/#facade/g, argv.accent)
}
fs.writeFileSync(path.join(root, 'index.html'), updatedIndex)

process.chdir(root)
var npmInstall = spawn.sync('npm', ['install'], { stdio: 'inherit' })

process.chdir(path.join(root, 'functions/generate'))
var npmInstall = spawn.sync('npm', ['install'], { stdio: 'inherit' })

process.chdir(root)
var netlifyDeploy = spawn.sync(
  './node_modules/.bin/netlify',
  ['deploy', '--prod', '--open', '--functions', 'functions'],
  { stdio: 'inherit' }
)

function writeDb(corpus) {
  m.seed(corpus, () => {
    fs.writeFileSync(path.join(root, 'functions/generate/db.json'), JSON.stringify(m.getDb()))
  })
}

return true
