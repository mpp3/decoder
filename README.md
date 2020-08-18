# decoder

Move around inside a computer's memory, looking to bytes through the glasses of a variable.

## Who is this for?

Anyone interested in understanding the relationship between variables and bytes (bits and values) through types.

But, mostly, for computer science teachers, who want their students to *visualize* the concepts of variable, type, and value.

If you teach computer science, use this small tool to support your introductory explanations of those topics.

## Where can I find this?

In one click (ready to go)... here! --> [decoder@firebase](https://decoder-3e9ea.web.app/)

In your computer... a few steps ahead:

Command line required:

1. Clone this repo: `git clone http://github.com/manuelperezpinar/decoder.git`
2. Run a local web server like: `python3 -m http.server` or `python -m SimpleHTTPServer`
3. Open a browser and navigate to: `localhost:8000`

In fact, you don't need steps two or three: this a simple single-page javascript ([ZIM](https://zimjs.com/index.html) and [ZIM PIZZAZZ](https://zimjs.org/cdn/pizzazz_02.js) powered) web app, without any asynchronous request (pure front). Hence, even shorter:

1. Clone this repo: `git clone http://github.com/manuelperezpinar/decoder.git`
2. Double click the file `decoder/public/index.html`

Actually, you only need three files, which are in the `public` folder in the repo: `index.html`, `decoder.js` and `pizzazz_02.js`. So:

1. Download those files from the repo. You know (don't you?), open the file, click `Raw` button, and right-click and `Save as...`; or click in this links: [`index.html`](https://raw.githubusercontent.com/manuelperezpinar/decoder/master/public/index.html), [`decoder.js`](https://raw.githubusercontent.com/manuelperezpinar/decoder/master/public/decoder.js) and [`pizzazz_02.js`](https://raw.githubusercontent.com/manuelperezpinar/decoder/master/public/pizzazz_02.js)
2. Put them in a folder (wherever you like).
3. Double click `index.html`


## How to use it?

- Click on a button to create a variable of the desired type. 
- Move the variable over the memory, and see how it *interprets* the bits beneath. 
- Drop the variable on a specific address of memory.
- Hover to see the bits behind the value.
- Clic the particles to get random bytes in memory.
- Double click a byte to edit its bits.
- Stay tuned for features to come...

If in doubt, just click.

## What's behind?

[ZIM JavaScript Canvas Framework](https://zimjs.com/index.html)