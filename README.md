# Bible Outlines for PCA Ordination Exams

A study guide for the **Bible content** exam for licensure and ordination in the Presbyterian Church in America (PCA). It follows the requirements in Bryan Chapell and Jim Meek, *Preparing for Licensure and Ordination Exams* (PCA CE&P, 2002).

The material is published two ways from **one source**:

- **Website:** a searchable GitHub Pages site built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- **Tier filter:** buttons at the bottom of every page show only Tier 1, Tier 2, or Tier 3 content. Which tier each item belongs to is set by rules in `docs/assets/javascripts/tiers.js`, mirroring the Exam Guide's tier list.
- **Booklet:** a printable half-letter Word booklet (`booklet/Bible Outlines.docx`, plus a PDF)

## What's Inside

| Section | Contents |
|---|---|
| Exam Guide | PCA requirements (BCO 19-2, 21-4); which books need outlines and which need summaries; a tiered study plan |
| Whole Bible | 66 / 39 / 27, the Ten Commandments, the law summarized, general revelation, the storyline |
| Old Testament | Outlines and summaries of all 39 books; timeline and covenants; people and places; key passages and events |
| New Testament | Life of Christ; outlines of the Gospels, Acts, the major Pauline letters, Hebrews, and Revelation; summaries of the rest; Paul's journeys and letters; people and places; Chapell's 60 key passages and 30 key topics |

## Repository Layout

```
docs/                     Markdown source (the single source of truth)
  old-testament/          OT book pages and reference pages
  new-testament/          NT book pages and reference pages
  assets/                 Site CSS, tier-filter script, and favicon
mkdocs.yml                Site config; the nav order is also the booklet's page order
booklet/
  Bible Outlines.docx     Generated booklet (do not edit by hand; see below)
  Bible Outlines.pdf      PDF export of the booklet
  src/template.docx       Original booklet: supplies the cover, styles, footer, and page size
  src/images/             Maps used only in the booklet
scripts/
  build_booklet.py        Markdown -> Word booklet
  export_pdf.ps1          Word -> PDF (Windows, needs Microsoft Word)
reference/                Chapell study guide PDF (git-ignored: copyrighted)
```

## Working on It

Set up once:

```bash
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # macOS/Linux: .venv/bin/pip
```

Preview the website with live reload at http://127.0.0.1:8000:

```bash
.venv/Scripts/mkdocs serve
```

Rebuild the booklet after editing any page, then export the PDF:

```bash
.venv/Scripts/python scripts/build_booklet.py
```

```bash
powershell -ExecutionPolicy Bypass -File scripts/export_pdf.ps1
```

**Edit the Markdown, not the generated `.docx`.** Changes made directly in `booklet/Bible Outlines.docx` are overwritten on the next build. To change the cover, fonts, or styles, edit `booklet/src/template.docx`. Only its cover page is kept; everything after it is regenerated.

### Booklet Layout Hints

Pages can include HTML comments that the website ignores but the booklet builder reads:

| Comment | Effect in the booklet |
|---|---|
| `<!-- pagebreak -->` | Start the next item on a new page |
| `<!-- colbreak -->` | Jump to the next column |
| `<!-- cols:1 -->` / `<!-- cols:2 -->` | New section with 1 or 2 columns on a new page (add `continuous` to stay on the same page) |
| `<!-- docx-image: ../../booklet/src/images/x.png width=2.8in -->` | Insert a picture |
| `<!-- docx-skip -->` ... `<!-- /docx-skip -->` | Website-only content |

Pages default to two columns after their title, matching the original booklet.

## Publishing to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In the repository, go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/pages.yml`, which builds the site and deploys it.
4. Set `site_url` and `repo_url` in `mkdocs.yml` to the published address.

## Copyright Notes

- Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.
- The Chapell and Meek study guide is copyrighted and is **not** committed (see `.gitignore`). The site quotes only its short question prompts.
- The cover woodcut and the two maps in `booklet/` come from the original booklet. The cover image is a stock illustration. Check its license before making the repository public, or replace it in `booklet/src/template.docx`.
