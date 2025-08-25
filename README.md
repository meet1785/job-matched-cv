<div align="center">
	<h1>Job Matched CV / ATS-Optimized Resume Generator</h1>
	<p>Create adaptive, ATS-friendly resumes aligned to specific job descriptions with heuristic parsing, keyword gap analysis, automation webhook delivery, and modern theming (light / dark / system).</p>
	<p>
		<strong>Live:</strong> <a href="https://meet1785.github.io/job-matched-cv/" target="_blank" rel="noopener">GitHub Pages Deployment</a>
	</p>
</div>

## ✨ Features

- Resume file parsing (PDF / DOCX) with structure + section heuristics
- Automatic extraction: name, contact, summary, skills, experience, education
- Dynamic job description analysis (keyword frequency, requirement lines, skill gaps)
- ATS scoring (keywords, formatting, sections completeness, readability)
- Make.com webhook integration (format preservation metadata & async response display)
- Theme toggle: system / light / dark (accessible palette & reduced eye strain)
- Reduced motion support (respects `prefers-reduced-motion`)
- Lazy loading of heavy parsing modules to reduce initial bundle size
- Modern responsive UI using Tailwind + shadcn-ui + glass surfaces

## 🧱 Tech Stack

| Layer | Tools |
|-------|-------|
| Build | Vite (React + SWC) |
| UI    | React 18, shadcn-ui (Radix primitives), Tailwind CSS |
| Logic | TypeScript, heuristic parsing & scoring utilities |
| State | Local component state + React Query scaffold |
| Automation | Make.com webhook integration |
| Deployment | GitHub Pages (gh-pages) |

## 📁 Key Directories

```
src/
	components/         UI + feature components (forms, scoring, integration)
	lib/
		resumeParser.ts   Resume parsing & format preservation
		jobAnalysis.ts    JD keyword + requirements + gap analysis
	pages/              Multi-step flow (Index)
	hooks/              Reusable hooks
	assets/             Static images
```

## 🚀 Getting Started

Requirements: Node.js 18+ (recommend using `nvm`).

```bash
git clone https://github.com/meet1785/job-matched-cv.git
cd job-matched-cv
npm install
npm run dev
```

Visit http://localhost:8080

## 🧪 Development Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Lint code
```

## 🌗 Theming & Accessibility

- Theme toggle stored in `localStorage` (falls back to system preference).
- Reduced motion: animations are minimized when user sets OS-level preference.
- High contrast adjustments & softened saturation to reduce visual fatigue.

## ⚙️ Deployment (GitHub Pages)

Already configured:

1. `homepage` field in `package.json`
2. `base` path in `vite.config.ts` for production
3. Scripts:
	 ```bash
	 npm run deploy  # Builds & publishes dist/ to gh-pages branch
	 ```
4. GitHub Pages points to the `gh-pages` branch.

## 🔌 Make.com Webhook Integration

- Default webhook URL configured in `MakeIntegration.tsx` (`PERMANENT_WEBHOOK`).
- Sends structured payload: candidate + job + analysis + format metadata.
- Awaits response and displays raw data or fallback text if CORS blocks body.

## 🧠 ATS Scoring Heuristics

Scoring categories combine:
- Keyword coverage (candidate vs extracted JD keywords)
- Section completeness (summary / experience / skills / education)
- Formatting quality (bullets, average line length, structure preservation)
- Readability (sentence length, action verbs, content length bounds)

Overall score uses weighted blend; easily extend in `ATSScoring.tsx`.

## 📦 Code Splitting

Heavy modules (e.g. PDF / DOCX parsing) are dynamically imported to shrink initial bundle size; add additional dynamic `import()` boundaries as features grow.

## 🔒 Privacy & Data

All parsing & analysis run client-side before optional webhook dispatch. No server persistence included by default.

## 🛣️ Roadmap Ideas

- Export tuned resume templates (multiple design variants)
- Fine-grained skill taxonomy classification
- Multi-language parsing support
- Download DOCX reconstruction with preserved layout
- Optional OpenAI / LLM enhancement layer (behind env-config)

## 🤝 Contributing

1. Fork & create a feature branch
2. Keep changes atomic & add concise commit messages
3. Submit a PR with a short rationale & before/after notes

## 🧾 License

MIT. See `LICENSE` if added (currently none provided).

---

Maintained by @meet1785 – feel free to open issues or feature requests.
