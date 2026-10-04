---
name: deep
description: >
  Deep architectural, debugging, and decision analysis explained in concise, context-rich,
  and accessible language with full technical precision.
  Triggered when the user invokes /deep, asks "explain in simple words", or wants an in-depth
  breakdown of root causes, fixes, advantages, tradeoffs, and alternative implementations.
---

When the user invokes `/deep` or requests an architectural/debugging breakdown, deliver a **concise, high-density, context-rich explanation** that balances simple conceptual clarity with exact technical depth.

## Core Philosophy

- **High-Signal, Low-Fluff**: Zero conversational filler, corporate preamble, or redundant sentences. Every word carries technical context.
- **Simple Mechanics, Exact Terminology**: Explain *how things work* in intuitive mental models without dumbing down the engineering reality. Retain exact function names, file paths, HTTP status codes, and data invariants.
- **End-to-End Tracing**: Always trace cause-and-effect through the real stack: UI (React/Next.js) → Edge/API (Express/Workers) → Persistence (Drizzle/Neon PostgreSQL) → Microservice (FastAPI/Groq/Chroma).

---

## Output Template for `/deep` Responses

Always structure every `/deep` analysis into these 5 tight sections:

### 1. The Core Breakdown (What Was Broken & Why)
- **Symptom & Impact**: What failed for the user or system in 1–2 sharp sentences.
- **Root Cause & Technical Mechanism**: The exact technical collision (e.g., state desync, race condition, missing precondition, schema mismatch). Contrast expected state vs actual state.

### 2. The Architectural Fix (How We Solved It)
- **End-to-End Resolution**: Walk through the fix sequentially across layers with exact file and symbol references:
  - **Client/UI**: State resets, mutation guards, pre-save triggers.
  - **API Gateway/Routing**: Schema validation, precondition checks, idempotency barriers.
  - **Domain Service & Database**: Transaction boundaries, state updates, fail-fast error propagation.
- **Guarantees Added**: The new invariants enforced (e.g., HTTP 409 on duplicate conversion, HTTP 422 on unconfirmed scope, penny-exact invoice rounding).

### 3. Concrete Advantages (Why This Works Best)
- 3–4 tight bullets highlighting tangible gains:
  - **Reliability & Data Integrity**: (e.g., zero orphaned rows, strict idempotency).
  - **User Experience**: (e.g., zero-friction conversion, preserved edits).
  - **Security & Resource Bounds**: (e.g., input size caps, cost containment).

### 4. Real Tradeoffs & Limitations
- **Operational / Performance Cost**: Extra network roundtrips, increased DB serialization, or memory overhead.
- **Architectural Constraints**: Inflexibilities introduced (e.g., 1-to-1 scope-to-project locking, strict confirmation gating).

### 5. Alternative Approaches Evaluated
Present 2–3 alternatives in a quick comparison table or compact bullet blocks:
| Approach | Concept | Fatal Flaw / Why Rejected |
| :--- | :--- | :--- |
| **Alternative A** | Description | Downside, security gap, or friction |
| **Alternative B** | Description | Downside, complexity, or maintenance burden |
| **Chosen Path** | Description | Balances UX, auditability, and system safety |

---

## Tone & Vocabulary Rules

1. **Context-Rich Verbs & Nouns**: Use precise verbs (`serialize`, `propagate`, `reconcile`, `invalidate`, `enforce`, `clamp`) rather than generic phrasing (`handle`, `do`, `make it work`).
2. **Accessible Analogies**: When an architectural concept is abstract, use a single, sharp 1-sentence analogy, then immediately anchor it back to the code.
3. **No Fluff Openers**: Never start with "Sure! Here is an in-depth breakdown..." Jump straight to `## 1. The Core Breakdown`.
