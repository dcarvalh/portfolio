# portfolio
Personal portfolio Website showcasing my work and academic experiences.


## Credits

Icons are from [Font Awesome Free](https://fontawesome.com) 6.5.2, inlined as SVG and
licensed under [CC BY 4.0](https://fontawesome.com/license/free).


## Licensing [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)   [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

### MIT License - All code
The content of this work (code) is licensed under a MIT license.

### LICENSE-CC-BY-NC - All content

The content of this work (text, images, data) is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

## Running locally

The page loads its text from `assets/i18n/*.json`, so it has to be served by a local web
server. Opening `index.html` directly from disk shows empty sections.

```bash
./run-local.sh
```

Then open <http://localhost:3000>. The script uses [lite-server](https://github.com/johnpapa/lite-server),
which reloads the page whenever you save an HTML, CSS or JS file. On first run it downloads
lite-server with `npm install`. Without Node.js/npm it falls back to Python's built-in server
(no auto-reload).

Edits to the translation files (`assets/i18n/*.json`) don't trigger a reload, so refresh the page
to see them.

### Using this repo as a starting point for your own portfolio

The site was built from the [Start Bootstrap Resume](https://startbootstrap.com/theme/resume)
template. To start over from the blank template:

```bash
npm install
npm run reset-to-template
```

> [!WARNING]
> `reset-to-template` **overwrites** `index.html`, `css/`, `js/` and `assets/img/` with the
> original template files. It never runs on its own and asks you to type `yes` before doing anything.


[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg
