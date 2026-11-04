# Bioanalytical Toolkit

Eight bench calculators for bioanalytical work.

**Live demo:** https://bioanalytical-toolkit.randomthingsonlineatsk.workers.dev


> This is a fictional, educational demonstration. Do not use it for real patient data, clinical decisions or regulatory submissions.

## Features
- Dilution (C1V1=C2V2), molarity/mass, serial dilution
- LOD/LOQ, linear regression with back-calculation
- Precision and accuracy, recovery, QC / Levey-Jennings chart

## Tech stack
React, TanStack Start, Tailwind CSS v4. Runs entirely in the browser; no backend or login.

## Attribution
Created by **Khan Gulrez Shagufa Fazal Ahmed**.

If you reuse or adapt this project, please credit the original author and link back to https://github.com/randomthingsonlineatsk-cloud/bioanalytical-toolkit. The Apache License 2.0 requires you to keep the `LICENSE` and `NOTICE` files with any copy you distribute.

## License
Licensed under the [Apache License 2.0](LICENSE). Copyright 2026 Khan Gulrez Shagufa Fazal Ahmed.

## Run locally
```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
npm run build
```

## Deploy on Cloudflare (static)
Build variable `NITRO_PRESET=node-server`; build command `npm install --legacy-peer-deps && npm run build`; deploy command `npx wrangler deploy --assets .output/public --name <worker-name> --compatibility-date 2026-01-01`.
