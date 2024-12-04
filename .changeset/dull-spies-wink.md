---
"jsrepo": patch
---

Imports like `$lib/assets/icons` that end up resolving to the category root will not resolve to `$lib/assets/icons/index` as is the expected behavior with JS.
