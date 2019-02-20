# lorem-ipsum-generator-generator
Generate a lorem ipsum generator site using [Mercury Parser](https://mercury.postlight.com)

## Before you install

1. Install [node](https://nodejs.org).
2. [Create a Netlify account](https://app.netlify.com/signup).
3. Gather one or more URLs to use as the corpus for your lorem ipsum generator.

## Installation

```shell
$ npx lorem-ipsum-generator-generator
```

and follow the prompts.

or

```shell
$ npx lorem-ipsum-generator-generator \
  http://example.com \
  https://postlight.com/trackchanges/mercury-goes-open-source \
  --project-name "My Ipsum" \
  --logo https://placekitten.com/300/300 \
  --background https://placekitten.com/800/600 \
  --accent "#facade"
```

The generator will create a folder for your project, install the necessary node
packages, and kick off `netlify-cli` to deploy it to the web. The first time you use the
generator, you'll be asked to authorize it to connect to your Netlify account.

If you're not connecting it to an existing Netlify site, feel free to accept all
the defaults (everything can be changed later in Netlify's site settings pages).

Once the deploy succeeds, your new lorem ipsum generator will open in your
default browser. Enjoy!

## Hit the endpoint directly

Your generator is powered by a function that accepts GET requests at
`https://[your site id].netlify.com/.netlify/functions/generate`.

It accepts URL parameters for the number of paragraphs:
`https://fyreipsum.com/.netlify/functions/generate?paragraphs=3`

...or the number of words to return in a single paragraph:
`https://fyreipsum.com/.netlify/functions/generate?words=25`

and returns a JSON object with an array of paragraphs under the key `paragraphs`. 

## Customization

Feel free to customize your site and re-deploy it at will. All the styles and
behavior live in your site directory's `index.html`, including some social meta
tags you can update if you wire up your site to a domain name.

The Netlify function that generates the lorem ipsum text is created in the
`functions/generate` folder. It's small and easy to change, if you want different
defaults!

To re-deploy after your customizations, run `npm run deploy`.

