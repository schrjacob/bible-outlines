# Ordination Study Guide

A study guide for the five examinations for licensure and ordination in the Presbyterian Church in America (PCA): **Bible, Theology, Church Government, Church History, and Sacraments.** It follows the requirements and questions in Bryan Chapell and Jim Meek, *Preparing for Licensure and Ordination Exams* (PCA CE&P, 2002).

The material is published from **one source**:

- **Website:** a searchable GitHub Pages site built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/), with one tab and one color scheme per exam.
- **Tier filter:** buttons at the bottom of every page show only Tier 1, Tier 2, or Tier 3 content. On the Bible pages the tier of each item is set by rules in `docs/assets/javascripts/tiers.js`; on the question pages (Theology, Church Government, Church History, Sacraments) each row carries its tier in a `Tier` column.
- **Bible booklet:** a printable half-letter Word booklet of the Bible tab (`booklet/Bible Outlines.docx`, plus a PDF).

## What's Inside

| Tab | Contents |
|---|---|
| Bible | How to prepare and a tiered plan; whole-Bible questions; Old Testament (outlines and summaries of all 39 books, timeline and covenants, people and places, passages and events); New Testament (Life of Christ, Gospels, Acts, Paul, epistles, Revelation, people and places, the 60 key passages and 30 key topics) |
| Theology | Chapell's theology questions (A-K) in Westminster Confession order, with Scripture proofs; the Five Points, ordo salutis, and gospel outline; the Shorter Catechism memory list; hot topics |
| Church Government | The Book of Church Order in Chapell's order: principles, members, officers, courts, calling and ordination, congregational meetings, discipline, review and control, the Directory for Worship |
| Church History | Denominations, events, and definitions; Chapell's 41 people; the history of Presbyterianism in the US and of the PCA |
| Sacraments | Baptism and the Lord's Supper: meaning, mode, subjects, the Reformed view against the others, and the practical cases |

The Church Government pages were checked against the BCO text published at pcaac.org (through the 2026 General Assembly). The PCA-history page was checked against the PCA Historical Center (pcahistory.org); the other Church History pages were not checked against a source, and quotations from the Westminster Standards were checked against thewestminsterstandard.org (which shows the original 1646 text; the PCA's American revision differs in a few places, such as WCF 20.4, 23.3, 24.4, 25.6, and 31).

## Repository Layout

```
docs/                     Markdown source (the single source of truth)
  index.md                Home page (reached from the site title)
  bible/                  Bible tab: overview, whole Bible, old-testament/, new-testament/
  theology/               Theology tab
  church-government/      Church Government tab
  church-history/         Church History tab
  sacraments/             Sacraments tab
  assets/                 Site CSS (including the per-tab colors), tier-filter script, favicon
mkdocs.yml                Site config; the nav is the five tabs, and the Bible tab's order is the booklet's page order
booklet/
  Bible Outlines.docx     Generated booklet (do not edit by hand; see below)
  Bible Outlines.pdf      PDF export of the booklet
  src/template.docx       Original booklet: supplies the cover, styles, footer, and page size
  src/images/             Maps used only in the booklet
scripts/
  build_booklet.py        Markdown (Bible tab) -> Word booklet
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
