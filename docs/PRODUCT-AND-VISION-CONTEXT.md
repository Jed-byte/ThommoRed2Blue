# Product & Vision Context

This document captures the high-level use case and value of the platform so architecture and product decisions stay aligned.

---

## Use case

- **Who:** High-performance golf professionals (elite athletes).
- **Current offer:** Founder delivers **4 × 1-hour coaching sessions** at **£2,000 GBP**, sharing documents and material in person. Sessions cover mindset training and preparing for different scenarios.
- **IP:** The methodology and course material are the founder’s IP; they are not fully represented in the platform yet.

---

## Red2Blue

- **Red2Blue** is the **language and methodology** for recognising when you’re **not in control** (e.g. stressed, reactive) and shifting to a calmer, focused state.
- It is the core mindset framework the founder teaches.
- **The methodology is not sport-specific.** Red2Blue applies to any sport or high-performance context. The platform must support expansion to **any sport** (golf today; tennis, football, etc. later) using the same methodology, with sport-specific examples and content where helpful.

---

## Platform goal

1. **Disperse the material** – Make the same course material that’s shared in the 4 sessions available through the platform.
2. **Flo as methodology coach** – Have the AI chatbot **Flo** discuss and teach the Red2Blue methodology so athletes can get that value without the founder in the room every time.

So: **ingest the founder’s course material → use it to ground/train Flo → Flo delivers and discusses the methodology on the platform.**

---

## Architecture implications

- **Document ingestion:** The system must support **ingesting** the founder’s material (documents, slides, notes from the 4 sessions). That implies:
  - A way to upload/store course documents (and possibly structure them by session/topic).
  - A pipeline to process and index this material so Flo can use it (e.g. RAG over documents, or training/fine-tuning if chosen later).
- **Flo’s knowledge:** Flo should be grounded in (or trained on) this material so answers align with the founder’s methodology and wording, not generic advice.
- **Course/session structure:** The “4 sessions” and “course material” suggest the data model may need concepts like: course, session, lesson, or topic, and linking content to those.
- **Sport-agnostic product:** The platform should be built so it can expand to any sport. Schema (e.g. `sport` on users, techniques, scenarios), Flo prompts (parameterised by sport), and content (sport-specific techniques/scenarios) should all support multiple sports without a rewrite. Golf is the first sport; others can be added as content and configuration.

This context should guide: document ingestion design, Flo prompt/context design, any “course material” or “knowledge base” features, and ensuring the architecture stays sport-agnostic so Red2Blue can scale to any sport.
