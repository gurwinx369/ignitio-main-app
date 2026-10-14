# Ignitio — User Feedback Bug & Issue Tracker

**Source:** 50 user feedback responses (roadmap, dashboard, lesson player, Kyle AI assistant, gamification)
**Purpose:** Prioritized list of bugs/issues for engineering, with the actual user language behind each one and the recommended fix.

**Priority key**
- **P0 — Critical:** Breaks trust or blocks core flow. Fix first.
- **P1 — High:** Hurts conversion/retention, clear and repeated signal.
- **P2 — Medium:** UX/clarity improvement, not blocking.
- **P3 — Low:** Polish / copy fix.

---

## P0 — Critical

### 1. Dashboard and Profile show different "current roadmap" for the same user
**Affected area:** State management / roadmap progress sync
**Reported by:** Neha Gupta (#8), Yash Verma (#19), Abhay Tiwari (#37)

> "I liked seeing progress numbers on the dashboard and profile. However, the active roadmap shown in these two places did not appear consistent." — Neha Gupta
> "The Dashboard showed Python progress, while the Profile page showed System Design as the current roadmap. This could make students think their progress has been lost." — Yash Verma
> "The dashboard remembered my Python progress after navigation, which is useful. However, the Profile page did not reflect the same current roadmap." — Abhay Tiwari

**Why it's P0:** Users interpret this as lost progress, not a display bug. Directly damages trust in the product.
**Recommended fix:** Single source of truth for "active roadmap" (likely a backend field or cache) that both Dashboard and Profile read from — audit for a stale client-side cache or a race condition between the two views fetching roadmap state independently.

---

### 2. "Start Roadmap" primary CTA does not reliably work
**Affected area:** Dashboard primary CTA / navigation
**Reported by:** Rohan Kapoor (#11), Abhishek Soni (#27)

> "The main Start Roadmap button did not reliably take me to the next step, which was frustrating." — Rohan Kapoor
> "The most important action should be more reliable. If Start Roadmap does not respond, a new user may leave." — Abhishek Soni

**Why it's P0:** This is the primary conversion action for new users. Intermittent failure = direct drop-off risk.
**Recommended fix:** Reproduce across browsers/devices; check for race condition on roadmap-not-yet-loaded state, dead click handler, or broken deep link when no roadmap is selected yet.

---

## P1 — High

### 3. Code editor ("Run" feature) is shown but not accessible/verifiable
**Affected area:** Coding preview / in-browser editor
**Reported by:** Aman Kumar (#5), Mohit Yadav (#29), Deepak Yadav (#47)

> "I saw a Python code preview with a Run label, but I could not clearly find the actual editor or output area." — Aman Kumar
> "I could not verify whether the code actually runs because the editor was not accessible during testing." — Mohit Yadav
> "If the Run button opened an editor with output and errors, it could become a major reason to return." — Deepak Yadav

**Recommended fix:** Confirm the editor/output panel is actually wired up and reachable from the Run button in all roadmap card contexts (not just specific pages). This is flagged as a potential retention feature if fixed, so it's worth prioritizing over pure polish items.

---

### 4. Projects/practice work are referenced but have no discoverable entry point
**Affected area:** Course content → practical exercises
**Reported by:** Dev Patel (#17), Ananya Verma (#2), Meera Nair (#10), Tanvi Bansal (#28), Siddharth Bose (#39), Zoya Khan (#50)

> "I could see that C includes practice sets and mini-projects in its description. I still could not find where those projects would be opened or submitted." — Dev Patel

**Recommended fix:** Either surface existing project/assignment links in the UI (if they exist but aren't linked) or flag to product that this is a content gap, not just a UI gap — 6 independent respondents raised this.

---

### 5. 404 page has no recovery path back to the app
**Affected area:** Error page / navigation
**Reported by:** Harsh Agarwal (#21), Gaurav Srivastava (#41)

> "The 404 page clearly said that the page could not be found, but there was no obvious button to return to the dashboard." — Harsh Agarwal

**Recommended fix:** Add a "Back to Dashboard" button/link to the 404 page component. Low effort, removes a dead-end.

---

## P2 — Medium

### 6. Lesson estimated duration doesn't match actual video length
**Affected area:** Lesson player / metadata
**Reported by:** Vikram Joshi (#9)

> "The lesson player clearly showed how much watch time was required before completion. I was confused because the lesson estimate and embedded video duration appeared very different."

**Recommended fix:** Audit lesson metadata vs. actual video file duration; likely a data entry issue rather than a code bug.

---

### 7. Lesson completion/unlock threshold isn't transparent
**Affected area:** Lesson player / completion tracking
**Reported by:** Pranav Shah (#45)

> "The lesson completion rule was visible, but I did not complete the full watch threshold during testing. A student should be able to see exactly when the lesson will unlock."

**Recommended fix:** Add a visible progress indicator (e.g., "80% watched — 20% to unlock") rather than a binary locked/unlocked state.

---

### 8. Inconsistent lesson interaction affordances
**Affected area:** Roadmap/lesson list UI
**Reported by:** Esha Kapoor (#46)

> "Some lessons appeared as text while others had a clear start button. Consistent lesson affordances would make navigation easier."

**Recommended fix:** Standardize the lesson list item component so all lessons render with the same interactive affordance regardless of content type.

---

### 9. Kyle (AI assistant) has no timeout/retry handling
**Affected area:** Kyle AI assistant
**Reported by:** Nikhil Gupta (#15)

> "Kyle displayed a thinking state before answering, which made the interaction feel active. It would be better if the platform also showed a timeout or retry option when answers take longer."

**Recommended fix:** Add a timeout threshold with a visible retry/cancel action in the Kyle UI component.

---

### 10. Kyle Q&A state is lost when switching between Video and Ask Kyle tabs
**Affected area:** Lesson player / Kyle tab state
**Reported by:** Sakshi Joshi (#34)

> "It would be useful to preserve the question and answer when returning to the video."

**Recommended fix:** Persist Kyle conversation state in local component state (not reset on tab switch) for the duration of the lesson session.

---

### 11. Premium (GenAI) access/pricing status is unclear on the page
**Affected area:** Premium/monetization page
**Reported by:** Karan Mehta (#7), Farhan Ali (#35), Manya Sethi (#48)

> "The Premium page did not clearly explain pricing or upgrade benefits." — Karan Mehta
> "I could not tell whether the content was included in the account or required an upgrade." — Farhan Ali

**Recommended fix:** This is partly a content/product decision, but engineering should confirm the account-level "has Premium access" flag is actually being checked and rendered on that page — may be a display bug rather than just missing copy.

---

### 12. No guided starting point across 7 roadmaps
**Affected area:** Onboarding / roadmap selection
**Reported by:** Sneha Patel (#6), Muskan Arora (#32), Aditi Iyer (#18)

> "A first-time student may feel overwhelmed by seven different roadmaps. A short 'Start here' quiz could help." — Muskan Arora

**Recommended fix:** Product/UX decision (onboarding quiz or recommendation flow) — flag to product owner, not purely an engineering fix.

---

## P3 — Low / Copy Fixes

### 13. Broken notification copy
**Affected area:** Push notification prompt
**Reported by:** Riya Chatterjee (#26)

> "The notification prompt encouraged reminders, but the wording looked broken: 'Don't lose your to silence.'"

**Recommended fix:** Straightforward copy bug — find and fix the notification prompt string (likely a template variable not interpolating correctly, given the missing word).

---

### 14. "Energy 0/7" gamification metric is unexplained
**Affected area:** Gamification / streak system
**Reported by:** Nandini Rao (#24)

> "I was not immediately sure what Energy 0/7 meant or how it affected my learning."

**Recommended fix:** Add a tooltip/info icon explaining the Energy mechanic inline.

---

### 15. No time-remaining estimate for full roadmap
**Affected area:** Progress tracking
**Reported by:** Komal Sharma (#36)

**Recommended fix:** Compute estimated time remaining from lesson durations × remaining lesson count; display on dashboard/roadmap view.

---

### 16. Profile shows counts only, not skills gained or achievements
**Affected area:** Profile page
**Reported by:** Pooja Desai (#14), Priti Saxena (#40), Shreya Kulkarni (#30)

**Recommended fix:** Product/design scope — likely a new feature (achievements/skills module) rather than a bug.

---

## Summary table — priority counts

| Priority | Count | Theme |
|---|---|---|
| P0 | 2 | Roadmap state sync, Start Roadmap CTA |
| P1 | 3 | Code editor access, missing projects, 404 recovery |
| P2 | 7 | Lesson metadata, completion clarity, UI consistency, Kyle reliability, Premium clarity, onboarding guidance |
| P3 | 4 | Copy bug, gamification clarity, time estimates, profile depth |

---

## Full Respondent Table (all 50)

| # | Name | Review | Feedback Summary |
|---|------|--------|-------------------|
| 1 | Rahul Sharma | Roadmap structure (days/levels) is easy to follow; wants dashboard to clearly show active roadmap | Clear roadmap structure; current-roadmap mismatch |
| 2 | Ananya Verma | Python roadmap relevant for internships (AI/ML/dev); wants more visible project work | Strong career relevance; projects need better visibility |
| 3 | Arjun Singh | System Design covers APIs, DBs, caching, load balancing, queues, monitoring; wants clearer next-lesson recommendation | Good content breadth; next steps need clarity |
| 4 | Priya Sharma | Kyle gave useful contextual answers, better than a general chatbot | Contextual Kyle is useful |
| 5 | Aman Kumar | Saw Python code preview + Run label but couldn't find editor/output | Coding feature discoverability issue |
| 6 | Sneha Patel | Likes variety (Python, C, C++, DSA, Git, System Design); beginners need guidance on where to start | Good variety; beginners need recommendations |
| 7 | Karan Mehta | GenAI Premium topics (prompting, RAG, APIs, agents) attractive; pricing/upgrade benefits unclear | Relevant Premium content; unclear conversion details |
| 8 | Neha Gupta | Likes progress numbers on dashboard/profile; active roadmap inconsistent between the two | Progress visibility is good; state sync needed |
| 9 | Vikram Joshi | Lesson player shows required watch time clearly; confused by mismatch between estimate and video duration | Completion tracking visible; duration needs clarification |
| 10 | Meera Nair | System Design useful for placement prep; wants practice questions/assignments per topic | Strong placement relevance; more practice needed |
| 11 | Rohan Kapoor | Dashboard welcome message feels personalized; Start Roadmap button unreliable | Personalization works; primary CTA reliability issue |
| 12 | Isha Malhotra | Subtitles help in noisy environments or with language difficulty | Captions improve accessibility |
| 13 | Aditya Rao | Roadmap descriptions are simple and clear without opening each one | Clear value proposition |
| 14 | Pooja Desai | Profile shows lessons/assignments/roadmaps; wants certificates/achievement examples | Useful statistics; achievements need stronger motivation |
| 15 | Nikhil Gupta | Kyle's "thinking" state feels active; wants timeout/retry option for slow answers | Good loading state; failure handling can improve |
| 16 | Simran Kaur | Python course sequence (fundamentals → OOP) suits beginners | Well-structured beginner curriculum |
| 17 | Dev Patel | C course mentions practice sets/mini-projects but can't find where to open/submit them | Projects referenced but not discoverable |
| 18 | Aditi Iyer | Worlds section makes exploring paths engaging; wants career-goal-based recommendations | Good exploration; needs guided recommendations |
| 19 | Yash Verma | Dashboard shows Python progress, Profile shows System Design — looks like lost progress | Serious roadmap-state inconsistency |
| 20 | Kavya Shah | Lesson titles short/scannable; likes seeing duration upfront | Clear lesson information |
| 21 | Harsh Agarwal | 404 page message is clear but no button back to dashboard | Clear error message; weak recovery path |
| 22 | Divya Menon | Good for undecided students — programming, DSA, Git, AI, System Design all offered | Good for students seeking direction |
| 23 | Saurabh Jain | Roadmap cards show learner counts, duration, levels, descriptions — helps comparison | Helpful roadmap comparison information |
| 24 | Nandini Rao | Likes streak/energy system idea but "Energy 0/7" meaning unclear | Gamification needs clearer explanation |
| 25 | Manish Kumar | Lesson-level Ask Kyle gave a relevant answer — useful when stuck on video | Strong support for stuck learners |
| 26 | Riya Chatterjee | Notification prompt wording broken ("Don't lose your to silence") | Notification copy quality issue |
| 27 | Abhishek Soni | Dashboard layout is clean; unreliable Start Roadmap risks losing new users | CTA reliability affects conversion |
| 28 | Tanvi Bansal | Python roadmap markets itself for jobs/internships; wants a practical task per major section | Career messaging should connect to practice |
| 29 | Mohit Yadav | C/Python cards show code + Run labels but editor wasn't accessible to verify | Coding promise needs end-to-end verification |
| 30 | Shreya Kulkarni | Profile gives useful history overview; empty state could explain first achievement to unlock | Good empty state; add milestone guidance |
| 31 | Varun Mishra | System Design has logical progression (fundamentals → video streaming) | Logical advanced-learning progression |
| 32 | Muskan Arora | Seven roadmaps may overwhelm first-timers; suggests a "Start here" quiz | Choice overload risk |
| 33 | Ankit Deshmukh | Likes that Kyle warns answers may contain mistakes; wants more verification encouragement | Responsible AI disclaimer is useful |
| 34 | Sakshi Joshi | Separate Video/Ask Kyle tabs keep things focused; wants Q&A preserved when returning to video | Good organization; improve continuity |
| 35 | Farhan Ali | Premium GenAI path seems relevant; unclear if included in account or needs upgrade | Premium access status is unclear |
| 36 | Komal Sharma | Progress numbers are easy to track; wants estimated time remaining for full roadmap | Progress is visible; roadmap time remaining would help |
| 37 | Abhay Tiwari | Dashboard remembers Python progress after navigation; Profile doesn't match | Persistence works; cross-page sync needed |
| 38 | Juhi Mehta | Lesson content is approachable but lacks assessment — wants to confirm understanding | Add quizzes or knowledge checks |
| 39 | Siddharth Bose | Git/GitHub roadmap is valuable for placements; wants a branches/PR-based project | Good career topic; needs applied practice |
| 40 | Priti Saxena | Student role/snapshot feels personalized; wants skills-gained view, not just counts | Add skill-based progress |
| 41 | Gaurav Srivastava | Invalid roadmap route shows clear 404; needs a Dashboard button | Error message clear; navigation recovery missing |
| 42 | Lavanya Reddy | Kyle's in-lesson answer was detailed; wants a short summary + optional detail for mobile | Useful AI response; improve readability |
| 43 | Rohit Thakur | Learner counts on cards create social proof; wants completion rates/outcomes shown | Social proof present; outcome proof missing |
| 44 | Nisha Jain | Good fit for students from smaller colleges due to structured, career-oriented paths; wants more beginner tooling help | Strong access value; add setup support |
| 45 | Pranav Shah | Completion rule visible but didn't fully understand unlock threshold during test | Completion behavior needs clearer feedback |
| 46 | Esha Kapoor | Layout is organized but lesson affordances (text vs. button) are inconsistent | Inconsistent lesson interaction cues |
| 47 | Deepak Yadav | Code preview sparked interest; a working editor with output/errors could drive retention | Coding could become a retention feature |
| 48 | Manya Sethi | Premium GenAI content aligns with interests; page needs clearer target user/outcomes | Clarify Premium target user and outcomes |
| 49 | Rakesh Choudhary | Likes the combo of video + roadmaps + streaks + AI help; wants a more predictable end-to-end flow | Strong feature combination; improve flow reliability |
| 50 | Zoya Khan | Good foundation for internship/placement prep; retention depends on projects, coding practice, clear next steps | Retention depends on practical work and clear next steps |

---

*Generated from the Ignitio user feedback CSV (50 responses). No email addresses were present in the source data.*
