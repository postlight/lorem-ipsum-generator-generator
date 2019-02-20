#! /usr/bin/env/node

var fs        = require("fs")
var spawn     = require("cross-spawn")
var path      = require("path")
var Mercury   = require("@postlight/mercury-parser")
var markov    = require("markov")
var slugify   = require("slugify")
var commander = require("commander")
var inquirer  = require("inquirer")

var program = new commander.Command('lorem-ipsum-generator-generator')
  .version("1.0.0")
  .usage('<urls ...> [options]')
  .option('-p, --project-name [name]')
  .option('-l, --logo [logo]')
  .option('-b, --background [background]')
  .option('-a, --accent [accent]')
  .parse(process.argv)

var options = {
  name:       program.projectName,
  logo:       program.logo || 'https://placekitten.com/300/300',
  background: program.background || 'https://placekitten.com/800/600',
  accent:     program.accent || '#facade',
  urls:       program.args
}

run()

async function run() {
  if (!options.name) {
    await ask()
  }
  if (options.urls.length === 0) {
    await askUrls()
  }
  generate()
}

async function ask() {
  var answers = await inquirer.prompt([
    {
      type:     'input',
      name:     'name',
      message:  'Name of your generator:',
      default:  options.name,
      validate: Boolean
    },
    {
      type:    'input',
      name:    'logo',
      message: 'URL of a logo image:',
      default: options.logo
    },
    {
      type:    'input',
      name:    'background',
      message: 'URL of a background image:',
      default: options.background
    },
    {
      type:    'input',
      name:    'accent',
      message: 'Accent color (hex, rgb, named color, whatever):',
      default: options.accent
    }
  ])

  options.name       = answers.name
  options.logo       = answers.logo
  options.background = answers.background
  options.accent     = answers.accent
}

async function askUrls() {
  var answers = await inquirer.prompt([
    {
      type:    'input',
      name:    'url',
      message: 'URL of a source for your generator:'
    },
    {
      type:    'confirm',
      name:    'addUrl',
      message: 'Add another source?',
      default: true
    }
  ])

  options.urls.push(answers.url)
  if (answers.addUrl) {
    await askUrls()
  }
}

function generate() {
  var name = slugify(options.name, {lower: true})
  var root = path.resolve(name)
  var m    = markov(2)

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
      "netlify-cli": "2.7.4"
    }
  }
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2))

  Promise.all(options.urls.map(u => {
    return Mercury.parse(u, {contentType: 'text'}).then(result => {
      return result.content.trim()
    })
  })).then(res => { writeDb(res.join('\n')) })

  var index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  var updatedIndex = index.replace(/My Ipsum/g, options.name)
    .replace(/https:\/\/placekitten\.com\/300\/300/g, options.logo)
    .replace(/https:\/\/placekitten\.com\/800\/600/g, options.background)
    .replace(/#facade/g, options.accent)
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

  return true

  function writeDb(corpus) {
    m.seed(corpus, () => {
      fs.writeFileSync(path.join(root, 'functions/generate/db.json'), JSON.stringify(m.getDb()))
    })
  }
}

