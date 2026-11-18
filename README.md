# doorefolio

My personal portfolio that I have been developing locally, I decided to commit this to GitHub for further development or edits.

## Design

I decided to with a minimalistic monochrome, dark-only, space/astronomy themed — a sparse "deep field" starfield behind everything. It took me a while to make this work but I'm quite proud of how it turned out.

A few things worth knowing before poking around the code:

- **Starfield background** ([assets/js/starfield.js](assets/js/starfield.js)) - a three-layer parallax canvas with scroll + pointer response and a slow autonomous drift. Freezes to a single static frame under `prefers-reduced-motion`, pauses when the tab is hidden.
- **Everything degrades on purpose** - I built the site to stay fully readable and navigable with JavaScript disabled, animations gated behind `prefers-reduced-motion`, and focus states always visible.

## Project structure

```
doorefolio/
├── index.html              # hero, about, skills, work, contact
├── 404.html
├── work/
│   ├── _template.html      # copy this to add a new project page
│   └── <slug>.html         # one hand-written page per project
├── assets/
│   ├── css/                # base (tokens/reset), layout, components
│   ├── js/                 # starfield, hero portrait, nav/reveal behavior
│   ├── img/
│   └── favicon/
```

I wrote the project pages by hand instead of generating them from a data file which keeps things fast and simple.

## Running locally

No install step. Either:

- Open [index.html](index.html) directly in a browser, or
- Serve the folder so relative paths resolve the same way a real host would:
  ```
  python -m http.server 8000
  ```

## Adding a project

1. Copy [work/_template.html](work/_template.html) to `work/<slug>.html`.
2. Fill in the catalogue ID, title, meta line, tags, links, and an Overview/Features section (or whatever sections fit the project).
3. Add a matching card to the Work grid in [index.html](index.html).

## About photo

The About section expects a photo at `assets/img/about/portrait.jpg`. I'm keeping that one out of the repo on purpose (it's in .gitignore) and only adding it on the deployed host.