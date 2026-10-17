RADAR Matrix v15 DIVERSITY SHADOW — experimental, independent from CP-032.
Upload only radar_diversity_v15.js and radar_diversity_v15.html to the same GitHub folder as index.html, catalog_mobile.js and catalog139.json.
Open https://lobezno1976.github.io/radar-matrix-mobile.-Selecciona-Priva/radar_diversity_v15.html?v=15
Historical CSV must first be loaded in the original app in the SAME browser origin. No canonical files are replaced.

Technical scope: explores all 139 markets in training, retains diverse candidate chains, prohibits two legs from the same broad market family, requires 2.5% to 60% marginal historical reduction in both local and away training samples and 80% evaluability. Searches depth 3, 4, 5 and 6 with separate candidate pools. Training determines candidate choice; holdout is displayed only. Up to five candidates per depth. No prices, EV, calibration or Winamax API. Heuristic search, not global optimization. Results are exploratory.

Known limitations: broad family exclusivity can exclude valid complementary markets; minimum marginal drop and scoring weights are experimental assumptions, not validated; historical holdout is not independent across repeated user-driven trials; date normalization and club aliases should be audited; sample sizes can be small. Must be compared prospectively against frozen v11 before promotion. No modifications to CP-032.
