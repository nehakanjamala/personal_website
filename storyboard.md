# NK pool fill → beige greeting

NK draws its outline for 1.8 seconds. An SVG clip rises from the bottom of NK between 1.1 and 2.2 seconds, filling the mark with ink like a pool. The beige slice cuts through at 2.4–3 seconds, extends at 3–3.3 seconds, then expands diagonally across the viewport at 3.3–4.9 seconds.

The lowercase, smaller “hi, i'm neha!” greeting pops in at 4 seconds, overlapping the expanding slice and intro dissolve. Its background matches the beige slice. Scroll then expands the greeting’s ink slash into the dark biography. Entry and scroll animations use separate wrappers to avoid property conflicts.

Desktop and 390px mobile render without console errors or horizontal overflow. Reduced motion skips to the finished greeting. `?t=N` freezes the opening timeline for inspection.

The greeting now types one character every 0.12 seconds starting at 4s. The complete line keeps its width to avoid layout shifts; subtitle “here’s a little about me” fades in on one line underneath at 5.55s.

Typing correction: each character now has an explicit timeline visibility step, starting at 4.55s with 0.18s intervals. Verified successive frames show empty → h → hi → hi, → complete greeting. The subtitle restores its original 11px Arial uppercase lettering and 1.5px tracking, popping in after the last character. Asset version parameters refresh cached CSS and JavaScript.

Smooth typing: each character eases in over 0.14s with a 4px rise, on 0.18s beats. After the last character completes, a 0.15s pause precedes the shared subtitle, header, footer/social frame, controls, and scroll-cue entrance.

Faster typing: character beats are now 0.09s with 0.08s entrances, roughly twice the previous speed. Subtitle and frame timing remain derived from the last character’s completion.

## Underline scroll transition

The greeting’s separate diagonal mark is replaced by a 120px underline positioned 12px beneath the subtitle. It draws in with the subtitle. During the pinned scroll transition, it moves toward the viewport center, rotates through 540 degrees, and expands into the biography’s ink background. Scrolling backward restores the underline. Reduced motion omits the rotating transition. Desktop and mobile screenshots verified underline placement and full viewport coverage.

The beige NK slice now carries a soft espresso shadow edge, offset behind its diagonal movement. The trail stays approximately 10px wide during expansion and fades as the beige wipe completes.

Slice drag correction: the espresso gradient now sits on top of the beige slice along the exact same diagonal track. A 260-unit fading wake follows the moving cut tip, then disappears as the beige slice expands. The side-offset shadow is removed.

The slice drag tint is now very subtle: 3.5% espresso through the wake and 9% at its leading tip, preserving the predominantly beige slice.

The subtle drag is clipped to the small NK/N crossing area (local diagonal range −175 to 145), with a shorter 130-unit wake. It appears only as the slice crosses that area and fades before the full-screen extension.

Liquid NK fill: the rising SVG mask now has a traveling, layered wave surface, driven by the master GSAP clock. Sine easing keeps the upward flow continuous; wave amplitude grows in the middle and settles to zero at completion. The liquid remains clipped to the original NK geometry.

Stronger jar-like sloshing: the liquid surface now combines 60-unit rolling swells, 48-unit alternating tilt, and smaller counter-moving ripples. Motion tapers at the beginning and end, settling before the NK slice.

Slower liquid fill: rise now lasts 4 seconds (1.1–5.1s), with gentler wave travel. Slice and greeting shift 2.9s later, preserving their sequence after the fill completes.

Fill refinement: wave amplitude and surface tilt reduced by 25%; rise lasts 2 seconds (1.1–3.1s). Slice and greeting advance 2 seconds to follow the completed fill.

Two-point outline draw: two half-contour dashes grow simultaneously from positions 0 and 0.5 of the normalized NK path, closing their gaps into a continuous outline over 1.8 seconds. Liquid-fill and slice timing remain unchanged.

Exact outline origins: the contour is split into two true SVG arcs at N’s top-left (336.9,162.3) and K’s bottom-right (772.1,445.6). Both draw simultaneously for 1.8s, each ending at the other’s origin. Original logo geometry and liquid fill are preserved.

Added a 0.5-second hold after the NK slice cuts through, before its extension and expansion. Greeting and subsequent entrance timing shift together by 0.5 seconds.

Liquid now begins immediately when the outline finishes at 1.8s. Power1.out easing gives a visible initial rise; the fill still finishes before the slice at 3.1s.

Correction: restored the 2-second liquid rise and sine easing. Fill starts at the outline’s completion (1.8s), without a hold. Slice and greeting move later to preserve the fill duration and existing slice pause.

Reduced the perceived outline-to-fill gap: liquid begins at 1.35s, overlapping the outline’s final settling, and starts at NK’s actual bottom edge (447) rather than below it. The 2-second rise and wave strength remain unchanged.

A blinking cursor follows the latest typed character, using the same GSAP timeline clock. It fades after typing completes and is omitted under reduced motion.

Post-fill pause halved from 0.65s to 0.325s: fill completes at 3.35s and the NK slice starts at 3.675s. Later slice and greeting timings advance by 0.325s.

Outline/fill overlap is now 1 second: the liquid starts at 0.8s and the outline finishes at 1.8s. Fill duration stays 2 seconds; subsequent transitions advance 0.55s, retaining the 0.1625s post-fill pause.

Persistent frame now tests contact with the actual rotated and scaled underline ribbon on every scroll-animation update. NK and individual navigation elements switch to beige as the espresso wipe touches them, then follow the dark section beneath. Header stays fixed above the transition. Reverse scrolling restores espresso. Desktop/mobile scroll frames verified.

GSAP snapping now settles the home-to-about scroll transition at the About Me section’s top when scrolling downward, or at home when scrolling upward. Snap begins after a brief idle delay, uses eased motion, and is disabled for reduced motion. Desktop/mobile checks confirm About Me lands at viewport top.

Subtitle is hidden in initial HTML to prevent a pre-animation flash and appears only after the last typed character. About Me snaps to the exact bottom edge of the fixed header (67px desktop / 60px mobile in verification), avoiding overlap with the header.
