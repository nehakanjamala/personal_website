# Reference animation analysis

Inspected October 8, 2026 with Scrapling Fetcher, public HTML, linked CSS and JavaScript, and browser visual inspection. Both robots.txt files permit these page requests. Downloaded reference source was used for inspection only; implementation is original.

## Ownitt — https://ownitt.fr/

Next.js / React site with GSAP, ScrollTrigger and Lenis. The hero component creates a timeline pinned from `top top` for `+=100%`, with `scrub: .5`. It moves the logo upward by `yPercent: -170`, moves supporting content downward by `170`, and enlarges its asterisk group to `scale: 92` while rotating it by `+=600`. A dark background and veil complete the transition. This explains why a tiny graphic becomes the entire next scene.

The project sequence uses a pinned timeline and `clipPath: inset(100% 0% 0% 0%)` on incoming panels. Scrolling reveals each panel over the previous one. Text uses staggered GSAP transforms and opacity; project videos play only for the active panel. Components check `prefers-reduced-motion` and revert GSAP contexts when unmounted. Source chunks inspected: `0o0ge5vihhxq8.js` (hero and other home sections), `3fx7khqw92cx-.js` (projects), `2nik2fdjje8bi.js` (scroll integration).

The visual recipe: warm paper, near-black graphics, very large sans-serif text, italic serif accents, thin rules, small uppercase labels, generous space, and a small number of large gestures.

## AMI — https://www.azmicrocredit.org/consulting

Astro site. The expertise section imports a custom `engine.a2NxA2RQ.js`, rather than GSAP. Its CSS uses a sticky stage. Progress is derived from section top, height, viewport and header height. Each topic uses its `data-index`, `data-x`, and `data-y` to calculate a staggered local progress, eased with `1 - (1 - progress)^3`. Cards move from scattered x/y positions and `translateZ(-700px)` to their arranged positions, while rotating from roughly ±65 degrees and scaling from .35 to 1. Small viewports and reduced motion get a simpler layout. Source: `ExpertiseNetwork.astro_astro_type_script_index_0_lang.Jo0HF-8b.js`.

## Adaptation in this project

Existing NK introduction retained; original saved in `research/index-before-motion.html`. GSAP 3.13.0 was already local; ScrollTrigger 3.13.0 added locally. No Lenis needed: native scrolling with ScrollTrigger scrub provides the motion without changing scroll behavior.

`motion.js` creates an original radial SVG, pins its section for 120% viewport scroll distance, rotates and enlarges the graphic, then reveals the next message. The exploring cards animate from scattered transforms to a grid. Text reveals use transforms and opacity. Reduced-motion users see static content. Pause motion removes ScrollTriggers and clears animation states; the scene also has a skip link. New personal copy is provisional and does not claim employers, projects or achievements.

## Verification

JavaScript syntax check passed. Browser loaded all three local scripts without console errors. At 1440px, cards use four columns; at 390px, they use two. No horizontal document overflow at either width. Pause and resume controls changed state successfully. Original intro still appears on normal page load.

## Revised opening and supplied story

The centered greeting now reads “Hi, I’m Neha!” with a small uppercase subtitle and italic serif “about me.” The original NK diagonal is echoed by a small espresso slash. ScrollTrigger pins the greeting stage for 90% viewport distance, moves and fades the greeting, and scales the slash to cover the viewport before the dark biography section. Scroll reverses the transition. The radial graphic and exploratory placeholder cards have been replaced by the supplied biography, ECMO Bridge, WiCS, Wells Fargo, and sign-off. Later story scenes currently use short heading reveals; photo interactions and globe are not implemented.

Revised JavaScript passes syntax validation; browser reports no warnings or errors. At 390px, the greeting fits without horizontal overflow and the slash covers the viewport during the transition.
