import Header from '../components/Header'
import PageContent from '../layouts/PageContent'

const Changelog = () => {
	return (
		<PageContent
			title="metar.live updates"
			description="Catch up on the latest tweaks, polish, and new releases landing on metar.live.">
			<div class="dark:text-white-dark container text-black">
				<Header />
				<h1 class="pt-16 text-4xl font-bold">Changelog</h1>
				<p class="mt-4 text-lg">Here&apos;s what shipped recently.</p>

				<section class="pt-12">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Jan 21, 2026
						</span>
						<h2 class="text-xl font-semibold">Weather visibility upgrades</h2>
					</div>
					<ul class="mt-3 flex list-disc flex-col gap-2 pl-5 text-base">
						<li>
							Airport detail pages now include a dedicated weather overlay; when a field lacks its own
							station, the nearest reporting station is shown, chosen by distance.
						</li>
						<li>
							The search bar is refactored for sturdier input handling and smoother behavior on small
							screens.
						</li>
						<li>Data tiles now surface zero values correctly, preventing quiet gaps in the readouts.</li>
					</ul>
				</section>

				<section class="pt-10">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 27, 2025
						</span>
						<h2 class="text-xl font-semibold">Forecast timeline refit</h2>
					</div>
					<p class="mt-3 text-base">
						The forecast view received a full redesign centered on an interactive, scrollable timeline that
						displays each TAF segment in order. Wider spacing, clearer labels, and responsive hover states
						make it straightforward to review long forecasts and follow probability updates without losing
						context.
					</p>
				</section>

				<section class="pt-10">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 25, 2025
						</span>
						<h2 class="text-xl font-semibold">Favorites ready for duty</h2>
					</div>
					<p class="mt-3 text-base">
						Airport favorites rolled out with a dedicated home-page lane, capped at ten to keep the list
						actionable. Supporting tweaks cleaned up navigation and added onboarding hints so returning to
						core fields is quick whether you&apos;re planning or flying.
					</p>
				</section>

				<section class="pt-10">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 24, 2025
						</span>
						<h2 class="text-xl font-semibold">Operational touch-ups</h2>
					</div>
					<p class="mt-3 text-base">
						A series of refinements boosted reliability: pilots can now flag issues directly via the new
						report button, primary UI controls hold their layout on smaller viewports, and an API preconnect
						shaves time off initial weather loads.
					</p>
				</section>

				<section class="pt-10">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 20, 2025
						</span>
						<h2 class="text-xl font-semibold">Runway view clarity</h2>
					</div>
					<p class="mt-3 text-base">
						The runway renderer now scales consistently across devices, preserving key wind cues without
						cropping. Dark mode rendering on Safari was also corrected to keep the background contrast
						stable at night.
					</p>
				</section>

				<section class="pt-10">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 19, 2025
						</span>
						<h2 class="text-xl font-semibold">Interface redesign lands</h2>
					</div>
					<p class="mt-3 text-base">
						metar.live adopted a refreshed layout with a focus on contrast, typography, and faster access to
						high-value data. Follow-up fixes stabilized the dark theme so it performs consistently across
						browsers.
					</p>
				</section>

				<section class="pt-10 pb-16">
					<div class="flex flex-col gap-2">
						<span class="inline-flex w-fit items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-slate-700 uppercase dark:bg-white/10 dark:text-slate-300">
							Oct 12, 2025
						</span>
						<h2 class="text-xl font-semibold">Rebrand and tooling updates</h2>
					</div>
					<p class="mt-3 text-base">
						The platform officially rebranded from metar.gg to metar.live. Supporting changes brought the
						Tailwind v4 upgrade, refreshed Node tooling, and search improvements that better highlight
						airfields without METAR coverage.
					</p>
				</section>
			</div>
		</PageContent>
	)
}

export default Changelog
