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
