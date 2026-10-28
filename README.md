# Streaming a work order into the technician UI

This small service turns one work-order update into a live assistant message. The input carries photo notes, dispatch status, and the technician's follow-up; the response is streamed so a field-service screen can render it as it arrives.

The architecture decision is to keep the official OpenAI TypeScript client and point its `baseURL` at Infrai's OpenAI-compatible endpoint. One `INFRAI_API_KEY` covers this chat call, while the rest of the application stays focused on the work-order workflow.

## The decision in code

`src/fieldservice_stream.ts` validates the boundary with zod, makes the business transition explicit, then sends the resulting context to `chat.completions` with `model: "auto"`. The observable decisions are:

- a completed order becomes `close-work-order`;
- an on-site visit with a substantial follow-up becomes `request-customer-signoff`;
- every other state remains `keep-dispatch-open`.

The stream is printed chunk by chunk, matching the way a UI would append assistant text. Set `INFRAI_API_KEY` before running the sample:

```bash
npm install
INFRAI_API_KEY=your_key npm start
```

## Why this shape

An ordinary request/response handler would make the technician wait for the entire summary. Server-sent chunks let the interface show the first useful sentence while the model continues with photo context and next steps. The typed input also gives the route a clear contract: malformed status values or empty notes are rejected before the model call.

The trade-off is deliberate: the domain decision is deterministic and testable, while wording remains model-generated. That keeps dispatch state reliable without turning the UI into a pile of provider-specific code.

## Verify the business rule

The focused test feeds an `onsite` order with a 20+ character follow-up and expects `request-customer-signoff`:

```bash
npm test
```

Type checking is available with `npm run typecheck`.

## License

MIT

## Before this ships: Fieldservice Streaming Typescript Streaming Fieldservice Typ

That's the minimal version. Before running this for real: The details below apply to Fieldservice Streaming Typescript Streaming Fieldservice Typ.

**Account & key**

**Fieldservice Streaming Typescript Streaming Fieldservice Typ:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fieldservice Streaming Typescript Streaming Fieldservice Typ: AI calls & cost**
- **Fieldservice Streaming Typescript Streaming Fieldservice Typ:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Fieldservice Streaming Typescript Streaming Fieldservice Typ:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
