# Lumen Screening

Build "Lumen", a web app for school-based early screening of neurodevelopmental disorders using serious-game behavioural data. This is a university final year project prototype. Use React + Tailwind + shadcn/ui with clean, calm, accessible design. Palette: navy #1F3864, blue #2E75B6, amber accent #F2A33A, light background #F5F8FC; font Nunito. Logo: small amber sun icon + wordmark LUMEN. Use realistic MOCK DATA held in client state (no backend needed); every page must be a working, clickable screen and all actions (add student, start/end game period, assign label) must update the UI state.

CONTEXT: One deployment serves one institution (a school). The institution has its own database. A school has multiple Teachers, multiple Classes, and multiple Students. During a scheduled game period, a teacher takes a whole class to the computer lab and every student plays the serious games on their own PC. Session data (errors, session time, accuracy, response time) is saved to the institution database. Afterwards a Teacher or Clinician reviews each student's recorded sessions and assigns the target label (Y_true). Training of the model happens offline on the institution's server, so there are NO federated-learning controls in this UI.

ROLES: Teacher and Clinician (staff, logged in) and Student (lab PC, child-friendly, no account).

PAGES / MODULES (use a left or top nav for staff pages: Dashboard, Classes, Game Period, Review and Label; show institution chip "[Institution name]", role and Log out):
1. Staff Log In / Sign Up (/): split layout, navy brand panel with "Staff portal for your institution" and card with Log In / Sign Up tabs, role select (Teacher/Clinician), email, password, institution. Fake auth is fine.
2. Staff Dashboard (/dashboard): stat cards: Classes 3, Students 72, Sessions played 58, Labelled 40 of 58 with progress bar; "My classes" list (Class 4A 24 students, Class 4B 25, Class 5A 23) with Open buttons; "Next steps" card (1 Add students to a class, 2 Run a game period in the lab, 3 Review sessions and assign labels); "Start game period" button; a "sessions to label" button.
3. Classes and Students (/classes): class selector, table of students identified by CODE not full name (e.g. S-4A-01): school year, sessions played, label chip (Risk / No Risk / Not labelled / No sessions yet), View link to Review. "Add student" button.
4. Add Student (/classes/add): class select, student code, date of birth, school year, optional gender (include Prefer not to say), checkbox "Guardian consent for taking part in screening has been recorded by the institution", Cancel / Save student. New student must appear in the roster.
5. Game Period, teacher control (/game-period): shows class, "Computer lab", period status badge (Period open), End period button; list of students with PC number and status chips (Waiting, Playing, Paused, Finished); progress "x of 24 finished" with bar; a large class code card (e.g. 4A-7K2) that students type on their lab PC; link "Preview student screen". Simulate live status changes with a timer so statuses progress.
6. Student Start, lab PC (/play): child-friendly warm cream background (#FFF6E3), big LUMEN logo, large inputs for Class code and Student code, big Start button.
7. Tutorial (student): 3-step tutorial with step dots, big illustrated star, text "Tap the star when it shines!" and "Let's practice first. There is no wrong answer here.", Back / Next buttons. Call it "Tutorial".
8. Play Session (student): Pause button, progress bar, sound toggle, a large placeholder card titled "Serious game area" (do not name or invent specific games), Finish session button. Optionally make the placeholder interactive with a simple tap-the-star activity that records taps, reaction time and misses into the mock session record.
9. All Done (student): "Great job! You finished. Please tell your teacher and wait quietly." with a Done button back to the student start. Students never see any result.
10. Review and Label (/review) for Teacher or Clinician: filters (Class, Show: Not labelled / Labelled / All); left list of students with a green dot if labelled; main area with a table "Recorded game sessions" (date, session time, accuracy, errors, response time) using mock values; "Assign label" panel with three radio cards: Risk, No Risk, Leave unlabelled (default). Helper text: "Choose from your professional judgement. Leave it unlabelled if you are unsure. The label is saved as the target value for training." Optional note textarea, footer text "Screening label only, not a diagnosis. Saved with your name and time." and a "Save label and next" button that saves the label, updates the roster/dashboard counts and moves to the next unlabelled student.

RULES: Wording must be exactly "Risk" and "No Risk". Never use the word diagnosis as a result; include the disclaimer that this is a screening estimate, not a diagnosis. Do not mention specific game names, game counts or feature lists anywhere. Never display child full names, only student codes. Add a small footer note "Sample data for design only" on data pages. Responsive down to tablet width. Add clear routing between all pages.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c6debcc1-789e-4aa2-bb38-d3e7cc43cfd5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
