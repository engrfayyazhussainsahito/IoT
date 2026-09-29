# IoT & Cyber-Physical Systems Security — Interactive Course

A free, complete, MS-level interactive course in IoT and cyber-physical systems security,
built as a static site for GitHub Pages.

## Status: Complete

- **17 weeks**, **81 lessons**, every single one at full 19-section depth: Introduction, Learning Outcomes,
  Prerequisites, Core Concepts, Visual Learning (diagrams), Mind Map, Mathematical/Formal Foundations,
  Practical Examples, Code/Worked Examples, Security Perspective, Industry Perspective, Research Perspective,
  Case Study, Common Misconceptions, Summary, Glossary, Self-Assessment (quiz), Practice Lab, and Further Reading.
- **192 glossary terms**, fully searchable.
- From Week 0's lab setup and electronics fundamentals through Week 16's capstone defense and career roadmap —
  nothing is a stub or outline. Every lesson can be read end-to-end today.

## Hosting on GitHub Pages

1. Create a new GitHub repository and upload every file in this folder to the repository root.
2. Open the repository's **Settings → Pages**.
3. Under "Build and deployment," choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. Open the generated GitHub Pages URL — it can take a minute to go live.

## Structure

- `index.html` — course home, syllabus overview, hero
- `weeks/week-00/` … `weeks/week-16/` — each week's `index.html` overview plus one `.html` file per lesson
- `glossary.html` — searchable glossary of all 192 terms
- `search.html` — client-side search across every lesson
- `assets/css/style.css` — the editorial design system
- `assets/js/site.js` — navigation, theme, TOC, quiz, bookmarks, progress tracking
- `assets/js/nav-data.js`, `search-index.js`, `glossary-data.js` — generated data files

## Design

Editorial, essay-first theme (serif reading type, warm paper background, restrained accent color) inspired
by long-form technical writing rather than a typical docs-site template. Both light and dark themes are
included and persist via `localStorage`.

## Features

- Sidebar navigation with in-sidebar search, generated from `nav-data.js`
- Client-side search page and searchable glossary
- Dark mode with persistence, reading progress bar, scroll-spy table of contents
- Bookmarks and "mark complete" tracking via `localStorage`
- Interactive quiz blocks with instant feedback on every lesson
- Mermaid.js diagrams throughout (architecture diagrams, sequence diagrams, decision trees, Gantt-style plans)
- Copy-to-clipboard code blocks, print-to-PDF friendly lesson pages
- Fully responsive, accessible mobile navigation

## Editing content

Every lesson lives at `weeks/week-XX/<slug>.html` as a complete, standalone HTML file — edit directly, or
regenerate consistently by extending the Python source data (contact the original author's build notes, or
treat each lesson file as its own template for future edits: copy an existing lesson's structure for a new one).

If you add new glossary terms, append them to `assets/js/glossary-data.js` and to `glossary.html`'s term list.
If you add a new lesson entirely, add an entry to `assets/js/nav-data.js` and `assets/js/search-index.js` so
it appears in navigation and search.

## Safety & ethics rule

All labs and exercises assume isolated, authorized, and educational use only. This course does not include
instructions for unauthorized testing against real systems, networks, or spectrum you do not own or have
explicit written permission to test. See Week 0, Lesson 0.1 and Week 1, Lesson 1.4 for the full framing.

## Licenses

- Site code: MIT License (`LICENSE-CODE.md`)
- Course content: Creative Commons Attribution 4.0 (`LICENSE-CONTENT.md`)
