# Parallel Search Integration Decision

## Decision

Use the already enabled **Parallel** integration in Manus for development research, product research, and one-off operator analysis. Add Parallel to Agent Arena Voice only after the Voice companion needs user-facing, current-web answers that cannot be satisfied from authorized battle context.

## Comparison

| Approach | Best use | Tradeoffs | Cost and setup |
| --- | --- | --- | --- |
| Parallel in Manus | Research during product development, evidence gathering, and agent-assisted planning | Does not add a user-facing search feature to Agent Arena Voice | Already enabled; no new app secret or code path |
| Server-side Parallel in Agent Arena Voice | A deliberate “research this claim” voice feature with citations | Requires a Parallel API key, user authorization policy, rate limits, result provenance, and a bounded tool surface | Moderate one-time setup; usage is tied to search requests |

## Recommended Rollout

The first voice release should remain battle-scoped and read-only: the LiveKit agent explains the active battle from approved artifacts only. This preserves the low-usage design and prevents a conversational search feature from becoming an unbounded cost or prompt-injection vector.

For a later research feature, add a server-only `PARALLEL_API_KEY` and one purpose-built procedure. It should accept a concise objective plus two or three keyword queries, use a low-latency Search mode for interactive requests, enforce per-user limits, return title/URL/excerpt/citation data, and never give the browser or LiveKit worker the API key. Do not expose generic web browsing, arbitrary URL fetching, background deep research, or scheduled monitoring in v1.

The official Search API accepts a natural-language objective together with two or three focused keyword queries and returns LLM-oriented excerpts. Use that narrow contract rather than a free-form HTTP proxy. [1]

## References

[1] [Parallel Search API Quickstart](https://docs.parallel.ai/search/search-quickstart)
