---
displayNumber: 9
status: closed
priority: 2
createdAt: 2026-02-26T04:00:00.000000+00:00
updatedAt: 2026-02-26T08:04:45.278147+00:00
---

# feat: display unpacked package size

## Overview

Show the unpacked install size for each package so users can evaluate the footprint before adding a dependency.

## Tasks

- [x] Fetch `https://registry.npmjs.org/<pkg>/latest` and read `dist.unpackedSize`
- [x] Format the byte value into a human-readable string (e.g. `12 kB`, `1.3 MB`)
- [x] Add a size column/field to `PkgRow`
- [x] Handle packages where `unpackedSize` is not present

## Acceptance Criteria

- [x] Each package row shows formatted unpacked size
- [x] Displays `—` when the field is absent
