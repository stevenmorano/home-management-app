# Documentation Index

This folder contains the current product, implementation, operations, and decision
documentation for the Home Management Operating System.

## Core Docs

- [Product Design](product-design.md): accepted brainstorming output and product direction.
- [UI Design Direction](ui-design-direction.md): first visual direction for the dashboard and asset-detail experience.
- [Product Requirements](product-requirements.md): MVP requirements, user stories, success signals, and scope boundaries.
- [UX Flows](ux-flows.md): onboarding, dashboard, asset, work history, and reminder flows.
- [Mobile Visual QA](qa/mobile-visual-qa.md): authenticated mobile screenshot QA notes, polish results, and current visual follow-up.
- [Data Model](data-model.md): implemented and planned entities, relationships, and enum values.
- [Database Schema](database-schema.md): current Supabase migrations, tables, enums, triggers, and RLS policy shape.
- [Tech Stack Decision](tech-stack.md): recommended languages, frameworks, backend, deployment, and future iOS path.
- [Architecture Plan](architecture.md): selected architecture and current implementation state.
- [Security And Privacy](security-privacy.md): privacy, auth, upload, and data ownership expectations.
- [Roadmap](roadmap.md): staged path from docs to pilot to public SaaS.
- [Implementation Plan](implementation-plan.md): recommended build phases.
- [Development Guide](development.md): local setup, scaffold status, environment variables, and verification commands.
- [Supabase Auth Foundation](supabase-auth.md): auth routes, helpers, environment variables, and RLS preparation.
- [Supabase Setup And Verification](supabase-setup.md): local env setup, migration application, and end-to-end auth/property verification.

## Accepted Implementation Designs

- [Security Hardening](security-hardening-design.md): dependency, redirect, proxy, and security-test decisions.
- [Asset Health](asset-health-design.md): assessability, status, score, coverage, and deterministic test rules.
- [CI And Authenticated Browser Testing](ci-authenticated-testing-design.md): permanent automation account, RLS fixtures, and GitHub Actions.
- [Work History](work-history-design.md): Care Ledger schema, UI, service-date synchronization, RLS, and testing.

## Checkpoints

- [2026-07-28 Review And Work History Checkpoint](checkpoint-2026-07-28.md)

## Decision Records

- [ADR Index](adr/README.md)
- [ADR 0001: Property Health Command Center](adr/0001-property-health-command-center.md)
- [ADR 0002: Structured Guided Home Inventory](adr/0002-structured-guided-inventory.md)
- [ADR 0003: Calendar Sync In MVP](adr/0003-calendar-sync-in-mvp.md)
- [ADR 0004: TypeScript, Next.js, Supabase, And Expo](adr/0004-typescript-nextjs-supabase-expo.md)

## Documentation Maintenance

Update these docs whenever a product or technical decision changes. Keep decision records short and append new ADRs rather than rewriting history.
