# UI migration and review plan

Replace the original React/vinext dashboard with native Astro pages, matching Lab Index's compact research index, design tokens and filter controls. Keep 31 company dossiers, the source register, news, benchmarks and three historical briefings. The shared filters must apply OR within a dimension, AND across dimensions, and combine with search and sort while preserving URL state.

The home table prioritizes company identity and its sourced critical fact. At 880px hide review metadata; at 600px hide the separate layer column. Full profiles retain every field. Benchmark tables use bounded horizontal scroll with visible labels. Navigation wraps; the document itself must not scroll horizontally.

Review targets: company index, one dynamically discovered dossier, stack, benchmark tables, filtered news, briefing archive and a discovered report, source register, changes. Measure 375×720 and 1280×800 plus intermediate widths. Verify a mobile filter opens in a reachable sheet, query state survives filtering/reload, empty states are accurate, and there are no client errors. Inspect actual screenshots, not only CSS or viewport arithmetic.
