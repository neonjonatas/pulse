# AI Pipeline Context (Shinod)

## Purpose

Provide focused context for metadata analysis, fingerprinting, transcription, and reasoning stages so agents and developers can evolve the flow safely.

---

## Current Topology

`shinod-ai` is currently a single deployable service with three internal modules:

- Petrified
- Fort Minor
- Stereo

Target direction (planned): split into 3 independent microservices with no infra sharing and EDA-only communication through NATS.

---

## Stage Responsibilities

## Petrified

Responsibilities:

- consume `track.uploaded`
- generate fingerprint hash and audio hash
- detect duplicates
- emit fingerprint-stage outputs and failure events

Key outbound events:

- `track.petrified.generated`
- `track.petrified.song.unknown`
- `track.duplicate.detected`
- `track.petrified.failed`

## Fort Minor

Responsibilities:

- consume `track.petrified.generated`
- transcribe lyrics/content
- emit transcription lifecycle events

Key outbound events:

- `track.fort-minor.started`
- `track.fort-minor.completed`
- `track.fort-minor.failed`

## Stereo

Responsibilities:

- wait until fingerprint and transcription are both ready
- run reasoning decision pipeline
- emit approval/rejection/failure outcomes

Key outbound events:

- `track.stereo.started`
- `track.approved`
- `track.rejected`
- `track.stereo.failed`

---

## Known Hazards

## 1) Shared deployable boundary

Petrified, Fort Minor, and Stereo now communicate through clearer stage contracts, but they still ship inside one deployable service.

Impact:

- operational independence is still limited
- the eventual split requires service extraction work, not just contract reuse

## 2) Storage contract drift

Upload/storage refs can drift due to mixed bucket conventions (`tracks` vs `uploads`) and transitional payload aliases.

Impact:

- downstream artifact lookup failures

---

## Required AI Contract Minimums

Every AI stage handoff event should include:

- `trackId`
- timestamp (`occurredAt` or `*At`)
- prior-stage artifact references needed by next stage
- deterministic contract fields (avoid optional critical fields where possible)

---

## Split Plan Guidance (Petrified/Fort Minor/Stereo as independent micros)

When splitting:

- each microservice owns its own `infra` and deployment boundary
- no direct shared infra imports across the three services
- communication only via NATS subjects
- each stage declares explicit inbound/outbound event maps
- migration uses dual-run compatibility until contract stability is verified

---

## Validation Checklist

- [ ] Petrified event is delivered to both Fort Minor and Stereo reliably
- [ ] `track.approved` contract is sufficient for Mockingbird start
- [ ] AI storage refs are canonical and stable
- [ ] Duplicate/reject paths are terminally observable in Backstage
- [ ] Split services preserve behavior parity with current modular service
