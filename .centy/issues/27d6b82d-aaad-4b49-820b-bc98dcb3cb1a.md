---
displayNumber: 9
status: in-progress
priority: 2
createdAt: 2026-02-26T04:00:00.000000+00:00
updatedAt: 2026-02-26T01:59:22.871526+00:00
---

# feat: display unpacked package size

## Overview

Show the unpacked install size for each package so users can evaluate the footprint before adding a dependency.

## Tasks

- [ ] Fetch `https://registry.npmjs.org/<pkg>/latest` and read `dist.unpackedSize`
- [ ] Format the byte value into a human-readable string (e.g. `12 kB`, `1.3 MB`)
- [ ] Add a size column/field to `PkgRow`
- [ ] Handle packages where `unpackedSize` is not present

## Acceptance Criteria

- [ ] Each package row shows formatted unpacked size
- [ ] Displays `—` when the field is absent
