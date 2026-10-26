# Literary Clock: A Learning Project

An experiment in giving AI better instructions and better data.

The idea: tell the time through literature, with a different passage from a real book for every minute of the day. I built the first version in Google AI Studio to see how far a single, simple prompt would get me, then opened up the files to understand what I actually had. This repo is the record of that experiment and what I took from it.

View the original app in AI Studio: https://ai.studio/apps/48ecf506-5bd4-4ae1-b300-ddd8d9f9c917
Or the Github Pages version here: https://vincentkovar.github.io/Literary-Clock/

## Why Bother

While this may seem like a relatively frivolous creation, the deeper purpose is to test various workflow templates using data without real-world consequences. I may look foolish producing false quotes from famous novels but the impact is virtually nill compared to producing acccurate-looking data in fintech, medicine, edtech, law, or cybersecurity. 

Key takeaway: Literary Clock is functioning _as designed_. The core issue was (my) poor design.

## What the app actually contains

Reading the source showed two kinds of text behind the clock:

- **72 curated passages** in `src/data/curatedQuotes.ts`, each entered with an author, title and chapter.
- **19 sentence templates** in `src/data/quotesEngine.ts`. Each template is one written sentence in the style of an author, with a blank where the time goes. For any given minute, the app fills in the time and attaches the author and book name.

With 72 curated entries and 1,440 minutes in a day, at least 1,368 minutes can only show template text. So most of what the clock displays is new prose written in the manner of a classic author, not a passage from the book named underneath it.

A concrete example: "At three:52, Mrs. Hall heard a sudden commotion in the parlor. The stranger had left his door ajar..." is a template that echoes *The Invisible Man*. It is not a line from the novel. The odd "three:52" format comes from how the code joins an hour word to the minutes and (probably) from contextual memory where my preference for AP style leaked into an unrelated project.

I have not verified the 72 curated passages individually. Treat them as unchecked.

One note on the on-screen text: the app still carries its original description ("hand-picked passages," "public domain masterworks," "13,000+ passages"). That describes the goal of the project, not the contents of the files. This README is the accurate account.

## What I learned

The app did what its instructions and data structure allowed. My goal was full coverage of 1,440 minutes, and I gave it no source of real passages to draw from. Filling every minute with a template is a reasonable way to meet that goal. The gap was in what I supplied.

1. **Real quotes that name an exact minute are rare.** Covering every minute requires a dataset built by searching many real books for time mentions. That is a data job, and it has to be done before the AI is asked to do anything.
2. **Supply the data, then let the AI arrange it.** The AI is excellent at choosing, formatting and presenting. If I hand it a verified list of quotes, every quote on screen is real by construction.
3. **State the constraint that matters.** "Only use quotes from the provided file. If a minute has no match, show nothing." Allowing a blank is a legitimate design choice. The Literature Clock below does exactly that.
4. **Metadata is not evidence.** Authors, titles, chapters and a "1,440 minutes" tagline all looked authoritative. Only comparing a quote to its source tells you whether it is real.
5. **Read the files, not just the output.** The explanation was visible in the code in a few minutes. Guessing at causes from the outside would have been slower and less accurate.
6. **"Not found" does not mean "fake."** More on this below.

## A spot-check of the Author Clock

The Author Clock, the commercial product that inspired this project, uses human-curated quotes. I checked three of its displayed quotes against the books:

| Time | Author and book | Result |
|------|-----------------|--------|
| 8:42 p.m. | Jules Verne, *Around the World in Eighty Days* (Chapter 36) | Exact match with several online copies of the text |
| 6:00 a.m. | Roald Dahl, *Danny, the Champion of the World* | Exact match with a text copy of the book |
| 3:02 p.m. | Amelia E. Barr, *An Orkney Maid* | Exact match, found by reading the book text directly |

The Barr quote is the useful lesson. My first web searches could not find it, and I nearly called it a miss. The passage was real and was only found by reading the book itself. A failed search tells you about the search method, not about the quote. Three quotes is a small sample, not an audit.

## Working literary clocks with real quotes

These projects already do the data work this experiment skipped. I read each page's description; I have not audited their quotes.

- **Author Clock** (the inspiration): a physical e-paper clock from Author & Co. with a large human-curated library. https://www.authorandco.com/products/author-clock
- **Literature Clock** by Johs Enevoldsen: a free, open-source web tool that shows a sentence containing the current time, with the book and author listed below. Some minutes have no match and show blank. Its quotes live in a public CSV that grows through community pull requests. https://abakcus.com/tools/literature-clock
- **The data file behind it**, `litclock_annotated.csv`: roughly 3,600 lines of time-tagged quotes. The repository describes itself as based on the work of Jaap Meijers. https://github.com/JohsEnevoldsen/literature-clock/blob/master/litclock_annotated.csv
- **NovellaMate's "1,440 Literary Quotes"**: a blog post presenting one quote for every minute of the day, which the authors say they hand-selected from more than 100,000 passages. https://novellamate.com/blog/1440-literary-quotes-one-for-every-minute-of-the-day
- **The Literary Clock** (literaryclock.com): a site with a quote for every minute and a reference library of 1,313 books, with posts describing how quotes were gathered through crowdsourcing, data mining and specialist websites. https://www.literaryclock.com/posts/Lt5_Library

## Possible next steps

If I come back to this, the plan would be:

- Replace the templates with a real dataset such as the CSV above, and have the app only choose among those rows.
- Allow blank minutes instead of filling every slot.
- Keep a source and a verification status for each quote.
- Rewrite the on-screen text to match what the app does.
- Since the foundational purpose was not education but entertainment, I see how this framework could be applied to uses which are explicitly labelled, "for entertainment purposed only."

## Subsequent project

The Fortean Calendar: https://vincentkovar.github.io/fortean-calendar/

Data can be strange. So, I decided to make a project that intentionally uses data which isn't easily determined as "true" at first glance ergo, the Fortean Calendar. 

FYI- Charles Hoy Fort (August 6, 1874 – May 3, 1932) was an American writer and researcher who specialized in anomalous phenomena. The terms "Fortean" and "Forteana" are sometimes used to characterize various such phenomena. I also added more recent UFO and "Bigfoot" sightings. 

This leads us to a topic that I used to teach in Universities: just because something is citable, doesn't mean it is true.  A citation tells you where a claim came from. It doesn't tell you whether the claim holds up. Researchers call one version of this the "Woozle effect," or "evidence by citation": a source is cited again and again for a claim it doesn't actually support, until the repetition itself starts to look like proof. The name comes from Winnie-the-Pooh, where Pooh and Piglet follow tracks in the snow that turn out to be their own.

AI adds a faster loop. Text a model generates can be published, then cited, then collected as training data for the next model. Researchers have studied the extreme case and call it model collapse. That is why the habit from this project matters: trace a claim back to a source that can be thoroughly checked, and then ask whether that source ever supported it.

## Running locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Set `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app: `npm run dev`
