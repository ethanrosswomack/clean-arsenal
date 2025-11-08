# 🛠️ AetherDev: Development Structure Overview

This file tracks the architecture across all branch-based dev environments.

## Standard Branch Structure

Each symbolic branch contains:

- `dev/astro/shared/` → Global design, themes, and components for the branch
- `dev/astro/sites/` → Individual project builds (one per domain)
- `dev/onering/` → Central logic for "The One Worker", OneBucket KV, and Secrets Sync

## Roadmap

- Move *_branchindex sites into `dev/astro/sites/`
- Integrate .env + Secrets Worker
- Add Codespaces entrypoints and /map/ visual sync later
