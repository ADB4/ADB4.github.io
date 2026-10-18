---
masthead: "CALIBRATION"
title: "Type *Specimen*"
date: "2026-10-17"
category: "debug"
layout: "paged"
excerpt: "Every element the article renderer can output, for building a type hierarchy."
---
# Type Specimen

This article contains every element the Markdown renderer produces, in roughly the proportions a real article uses them. It deliberately avoids `&nbsp;` spacing, so every gap between blocks comes from the stylesheet alone.

---

## 1. Heading scale

# Heading 1 — Techniques for Efficient Woody Plants
## Heading 2 — Eight Months with the 2018 Jaguar F-TYPE R
### Heading 3 — Part 1: Tree Cards
#### Heading 4 — Published March 17, 2025
##### Heading 5 — Andy Bui
###### Heading 6 — Figure 1: Atlas layout

### Wrapped headings

# A first-level heading long enough to wrap onto a second line, to test leading at display size
## A second-level heading that also runs long enough to wrap, so its leading can be compared with body copy
### A third-level heading that wraps, which is where tight display leading most often collides

---

## 2. Headings in sequence

Every heading below is followed by body copy, so the space above and below each level can be judged against the paragraphs around it.

## A second-level section
An opening paragraph directly beneath an h2. Sections usually start this way, so the gap here sets the tone for the whole article.

### A third-level subsection
A paragraph beneath an h3. This gap should be smaller than the one under the h2, so the subsection reads as part of its section.

#### A fourth-level subsection
A paragraph beneath an h4.

##### A fifth-level heading
A paragraph beneath an h5.

###### A sixth-level heading
A paragraph beneath an h6.

## Stacked headings
### With nothing between them
#### Three levels deep
Text appears only after the third heading. This is where stacked margins usually go wrong.

---

## 3. Body copy

Body copy is the baseline every other style is measured against.

Set it first. Once the body size and line height feel right at reading distance, headings can be scaled up from it by a fixed ratio, and captions, labels, and code can be scaled down. A hierarchy built this way stays consistent because every size relates to every other size by the same arithmetic.

A comfortable line holds somewhere between 45 and 75 characters, spaces included. Longer lines make it hard for the eye to find the start of the next one; shorter lines break phrases apart and make the text feel choppy. Line height works with line length: a long measure needs more leading so the lines stay distinct, while a narrow column can be set tighter. Light weights usually need a little more leading and a little less negative tracking than regular weights, because their thinner strokes leave more white space inside each letter. This paragraph is deliberately long so that several full lines are visible at once, which is the only way to judge the texture of a block of text rather than a single line of it.

A single closing sentence, to compare against the block above.

---

## 4. Inline styles

Regular text, *italic text*, **bold text**, ***bold italic text***, and `inline code` on one line.

A sentence with *an italic phrase that continues long enough to wrap across a line break*, to check that the slant and weight stay readable at length.

**A fully bold paragraph, the kind used for lead-ins or warnings. It should still read as body copy, not as a heading.**

*A fully italic paragraph, the kind used for asides, captions, or editor's notes. It should sit quieter than the text around it without becoming hard to read.*

### A heading with *italic*, **bold**, and `code` inside it

Code in running text: set `font-variant-numeric: tabular-nums` where digits need to line up, and keep `line-height` unitless so it scales with `font-size`.

---

## 5. Links

An [inline link](/writing) in the middle of a sentence. A [link with a title](/writing "The writing index") and a [reference-style link][home]. An autolink: <https://example.com>. A link containing *[italic text](/writing)* and one containing [`code`](/writing).

**[A bold link](/writing)** and a link that runs [long enough to wrap across the end of a line, so the underline or color can be checked on both lines](/writing).

A long unbroken URL, to test overflow in a narrow column: <https://example.com/a/very/long/path/that/keeps/going/to/check/how/unbroken/strings/wrap/inside/the/article/column>

[home]: / "Home"

---

## 6. Numerals, punctuation, and character set

0123456789 — 1,234,567.89 — $55,000 — 550 hp — 0–60 in 3.5 s — 5:00 PM — 2025-11-19 — 3/17/2025 — 98.6°F — 50%

Dashes: hyphen-ated, an en dash for ranges like 1990–2025, an em dash—like this—and a spaced em dash — like this.

Quotes: “double curly,” ‘single curly,’ "straight double," 'straight single,' and the apostrophe in it’s and rock ’n’ roll.

An ellipsis… versus three periods... Ampersand & at @ hash # asterisk \* slash / backslash \\ pipe | tilde ~ caret ^ underscore \_ brackets [square] (round) {curly} \<angle\>.

ABCDEFGHIJKLMNOPQRSTUVWXYZ\
abcdefghijklmnopqrstuvwxyz\
Àà Éé Îî Õõ Üü Çç Ññ Øø Ææ ß

Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy dog.\
*Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy dog.*\
**Sphinx of black quartz, judge my vow. The quick brown fox jumps over the lazy dog.**

ALL CAPS SETTING, AS USED FOR LABELS AND NAVIGATION — CHECK WHETHER LETTER-SPACING NEEDS TO OPEN UP.

---

## 7. Lists

Unordered:

- A short item
- An item long enough to wrap onto a second line, which shows whether the wrapped text aligns with the first line or falls back under the bullet
- An item with *italic*, **bold**, and `code`
  - A nested item
  - Another nested item
    - A third level, usually the deepest an article needs

Ordered:

1. First step
2. Second step, long enough to wrap so the hanging indent can be checked against the numeral
3. Third step
   1. Nested step
   2. Another nested step

Ordered, starting at 8 to test the jump from one digit to two:

8. Eighth
9. Ninth
10. Tenth
11. Eleventh

A loose list, with blank lines between items, so each item is wrapped in a paragraph:

- The first item in a loose list. Paragraph styles now apply inside the list item.

- The second item, which shows whether paragraph margins stack badly with the list's own spacing.

- A third item with a second paragraph.

  This continuation paragraph belongs to the third item and should align with the item text, not the bullet.

---

## 8. Blockquotes

> A short pull quote, one sentence long.

> A longer quotation that runs across several lines. Quotations come from someone other than the author, so their styling should set them apart from the main text without overpowering it.
>
> A second paragraph in the same quotation.
>
> — Attribution line

> An outer quote.
>
> > A nested quote, as in a reply to a reply.

> A quote that contains a list:
>
> - First point
> - Second point

---

## 9. Code

A fenced block with a language tag:

```tsx
const ArticleComponent = ({ slug }: { slug: string }) => {
    const article = getPostBySlug(slug);

    if (!article) {
        notFound();
    }
    return <ReactMarkdown className="markdown-article">{article.content}</ReactMarkdown>;
};
```

A block with one very long line, to test horizontal overflow:

```
https://s3.us-east-2.amazonaws.com/static.rogerlib.com/static/models/chair0/tex/2048p/chairProgramme_BaseColor_sRGB.jpg?version=2&format=jpg
```

An indented code block, with no language:

    $ yarn dev
    ▲ Next.js 15.5.15
    ✓ Ready in 1352ms

---

## 10. Breaks

A horizontal rule follows.

---

Hard line breaks inside one paragraph, as in an address or verse:\
Austin, Texas\
30.2672° N, 97.7431° W

A line ending in two trailing spaces  
also forces a break, the way the older articles on this site do it.

---

## 11. In context

The sections above isolate each element. This one puts them together the way a real article would, so the hierarchy can be judged as a whole.

# Setting a Type Scale
### Part 1: Choosing a Ratio
##### Calibration · October 17, 2026

A type scale is a set of font sizes generated from one base size and one ratio. Multiply the base by the ratio to get the next size up, and divide to get the next size down. With a 16 px base and a ratio of 1.25, the steps run 12.8, 16, 20, 25, 31.25, and 39 px.

## Picking the ratio

Small ratios, from about 1.125 to 1.2, keep headings close to body size and suit dense layouts where many levels need to fit on screen. Large ratios, 1.333 and above, give headings real presence and suit editorial layouts with only a few levels.

> A heading should look like a heading before anyone reads it.

Three things to settle before going further:

1. The base size, usually the body copy.
2. The ratio, which sets the distance between levels.
3. How many levels the content actually needs. Most articles use three or four.

### Weight and style as levels

Size is not the only way to separate levels. Weight, *italics*, letter case, and color can each carry a level on its own, which lets two adjacent levels share a size and still read as different.

#### Next

Part 2 will cover line height and vertical rhythm.

##### Andy
