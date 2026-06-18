# NeuralNest-OS — Developer Test Checklist

> **Before you start:** Make sure both servers are running.
> - Backend: `cd backend && npm run dev` → http://localhost:8080
> - Frontend: `cd frontend && npm start` → http://localhost:3000
>
> Open the browser at http://localhost:3000 and follow each step in order.

---

## 1. Auth Flow

### 1.1 Register (Email/Password)
- [ ] Navigate to `/` — landing page should load with Sign In / Create Account tabs
- [ ] Click "Create Account" tab
- [ ] Fill in Name: `Test User`, Email: `test@neuralnest.com`, Password: `password123`
- [ ] Click "Create Account"
- [ ] **Expected:** Redirected to `/onboarding`
- [ ] **Expected:** No "Something went wrong" — if error, it should say exactly why (e.g. "This email is already registered")

### 1.2 Login (Email/Password)
- [ ] Logout from profile page first
- [ ] Click "Sign In" tab
- [ ] Try wrong password — **Expected:** Specific error: "Invalid email or password."
- [ ] Enter correct password — **Expected:** Redirected to roadmap or onboarding

### 1.3 Google OAuth
- [ ] Click "Continue with Google" — **Expected:** Redirected to Google sign-in, then back to `/auth/callback/google`
- [ ] **Expected:** Logged in and redirected to roadmap or onboarding

### 1.4 GitHub OAuth
- [ ] Click "Continue with GitHub" — **Expected:** Redirected to GitHub, then back to `/auth/callback/github`
- [ ] **Expected:** Logged in and redirected correctly

### 1.5 Session Restore
- [ ] While logged in, refresh the page (F5)
- [ ] **Expected:** Stays logged in — no redirect to landing page
- [ ] **Expected:** "Loading NeuralNest..." spinner shown briefly, then content loads

### 1.6 Token Expiry
- [ ] Open DevTools → Application → Local Storage → delete `token`
- [ ] Refresh the page
- [ ] **Expected:** Redirected to landing page
- [ ] **Expected:** Toast: "Your session has expired. Please log in again."

### 1.7 Password Validation
- [ ] Try registering with password `123` (< 8 chars)
- [ ] **Expected:** Inline error BEFORE API call: "Password must be at least 8 characters."

---

## 2. Onboarding

### 2.1 PDF Upload
- [ ] Go to `/onboarding`
- [ ] Select "Upload Syllabus" tab
- [ ] Drag & drop or click to upload a PDF (any PDF file)
- [ ] Click "Next Step"
- [ ] **Expected:** Loading spinner while uploading
- [ ] **Expected:** Step 3 shows skeleton while topics are extracted
- [ ] **Expected:** Step 3 shows real topic names from the PDF (not hardcoded OS topics)
- [ ] **Error case:** Upload a non-PDF file → **Expected:** "Only PDF files are accepted."
- [ ] **Error case:** Upload 15MB file → **Expected:** "File too large. Maximum size is 10MB."

### 2.2 Paste Notes
- [ ] Select "Paste Notes" tab
- [ ] Paste any text (study notes, textbook extract)
- [ ] Click "Next Step"
- [ ] **Expected:** Topics extracted from text and shown in step 3

### 2.3 Single Topic
- [ ] Select "Single Topic" tab
- [ ] Type: `Machine Learning`
- [ ] Complete all 3 steps
- [ ] Click "Generate Roadmap"
- [ ] **Expected:** Redirected to `/roadmap`

### 2.4 Explanation Level
- [ ] In step 2, select each level (Beginner/Intermediate/Advanced)
- [ ] **Expected:** Selection highlights correctly with active border

### 2.5 Empty Submission
- [ ] Click "Next Step" without selecting a file or typing anything
- [ ] **Expected:** Specific error: "Please select a PDF file to upload." (NOT silent)

---

## 3. Roadmap

### 3.1 Loads Real Data
- [ ] Navigate to `/roadmap`
- [ ] **Expected:** Topics from your onboarding session appear as nodes (not the hardcoded OS topics)
- [ ] **Expected:** Node colors: gray (unstarted), yellow (learning), green (mastered)
- [ ] **Expected:** Stats pills show real counts (not hardcoded "1 Mastered")

### 3.2 Days Left Pill
- [ ] Set up an exam in Exam Mode, then return to Roadmap
- [ ] **Expected:** Orange "N Days Left" pill appears
- [ ] Without exam set → **Expected:** Pill does NOT show

### 3.3 Node Click → Start Learning
- [ ] Click any node
- [ ] **Expected:** Details popup appears with correct topic info
- [ ] Click "Start Learning"
- [ ] **Expected:** Navigates to `/tutor/:topicId`

### 3.4 Node Click → Take Quiz
- [ ] Click a node, click "Take Quiz"
- [ ] **Expected:** Navigates to `/quiz/:topicId`

### 3.5 Empty State (New User)
- [ ] Log in as a brand new user who hasn't completed onboarding
- [ ] Navigate to `/roadmap`
- [ ] **Expected:** Empty state: "Upload a syllabus or start a topic to build your roadmap." with CTA button

### 3.6 Backend Error
- [ ] Stop the backend server (`Ctrl+C`)
- [ ] Refresh the roadmap page
- [ ] **Expected:** Inline error with message (not blank page): "Failed to load your roadmap. Please try again." with Retry button
- [ ] Restart the backend, click Retry
- [ ] **Expected:** Roadmap loads again

---

## 4. AI Tutor Chat

### 4.1 Empty State
- [ ] Navigate to `/tutor/machine-learning` (use your real topicId)
- [ ] **Expected:** Quick Action Cards shown ("Explain my lecture notes", etc.)
- [ ] **Expected:** "Start Teaching →" button visible

### 4.2 Start Teaching
- [ ] Click "Start Teaching →"
- [ ] **Expected:** Message sent, AI starts streaming response token-by-token
- [ ] **Expected:** Typing indicator shows while streaming
- [ ] **Expected:** Once complete, 3 comprehension chips appear: [Understood] [Need more help] [Go deeper]

### 4.3 Comprehension Chips
- [ ] Click "Understood! Let's proceed."
- [ ] **Expected:** New user message added, AI continues to next concept

### 4.4 Ask a Question
- [ ] Type "Why does this happen?" in the input
- [ ] **Expected:** AI answers as a "doubt" response

### 4.5 Proceed to Quiz Button
- [ ] After a few messages, click "Proceed to Quiz"
- [ ] **Expected:** Navigates to `/quiz/:topicId`

### 4.6 Stream Failure
- [ ] Start a conversation, then kill the backend mid-stream
- [ ] **Expected:** Retry button appears, toast: "Connection interrupted..."
- [ ] Restart backend, click Retry
- [ ] **Expected:** Message sent again

### 4.7 Chat Saved in Sidebar
- [ ] After starting a session, check the sidebar
- [ ] **Expected:** New chat entry appears under "Roadmap" section

### 4.8 Attach Materials
- [ ] Click the paperclip icon
- [ ] **Expected:** MaterialsModal opens with your session's uploaded files (not hardcoded AI Engineering materials)
- [ ] If no files: "No materials yet — upload your first file above."

---

## 5. Quiz

### 5.1 Questions Load
- [ ] Navigate to `/quiz/:topicId` via "Proceed to Quiz" or Roadmap node
- [ ] **Expected:** "Generating Quiz..." skeleton shown
- [ ] **Expected:** 10 real MCQ questions appear (not the hardcoded 3 OS questions)
- [ ] **Expected:** Timer starts counting down

### 5.2 Answer a Question
- [ ] Click an answer
- [ ] **Expected:** Color feedback (green = correct, red = wrong)
- [ ] **Expected:** +20 XP popup if correct
- [ ] **Expected:** Heart lost if wrong

### 5.3 Explanation
- [ ] Answer wrong, click "Explain"
- [ ] **Expected:** Explanation card appears with the AI's explanation

### 5.4 Quiz Completion
- [ ] Complete all 10 questions
- [ ] **Expected:** Score Summary shown with real data (score, XP, pass/fail)
- [ ] **Expected:** If ≥70% correct → "Topic mastered!" toast
- [ ] **Expected:** Node color on roadmap updated (yellow → green if passed)

### 5.5 Quiz Failure (0 lives)
- [ ] Answer 5 questions wrong in a row (lose all hearts)
- [ ] **Expected:** Quiz ends automatically, score summary shown

### 5.6 Timer Expiry
- [ ] Let timer run to 0 (or inspect and manually trigger)
- [ ] **Expected:** Quiz auto-submits, score summary shown

### 5.7 Generation Error
- [ ] Kill backend, try starting a quiz
- [ ] **Expected:** Specific error: "Couldn't generate quiz questions. The AI is busy — try again." with Retry button

---

## 6. Dashboard

### 6.1 Data Loads
- [ ] Navigate to `/dashboard`
- [ ] **Expected:** Skeleton loaders show briefly, then real data
- [ ] **Expected:** Mastery ring shows real % (not hardcoded 33.7%)
- [ ] **Expected:** Topic table shows your real topics

### 6.2 No Data (New User)
- [ ] As a brand-new user (no quizzes done)
- [ ] **Expected:** Empty state: "No progress data yet. Complete a lesson and quiz to see scores here." (NOT an empty broken table)
- [ ] **Expected:** "No exam set" placeholder for countdown widget (not "5 Days Left")
- [ ] **Expected:** "No rescue plan yet" placeholder for timeline

### 6.3 Study Button
- [ ] Click the Study (play) button on any topic row
- [ ] **Expected:** Navigates to `/tutor/:topicId`

### 6.4 AI Recommended Card
- [ ] After completing a quiz, return to dashboard
- [ ] **Expected:** "AI Recommended" card shows the next topic (not hardcoded "Virtual Memory")

---

## 7. Exam Mode

### 7.1 Setup Wizard Step 1
- [ ] Navigate to `/exam`
- [ ] **Expected:** Setup wizard shown (not the roadmap — you haven't set up an exam yet)
- [ ] Try clicking "Next" with empty subject name
- [ ] **Expected:** Error: "Please enter your subject name."
- [ ] Set exam date in the past
- [ ] **Expected:** Error: "Exam date must be in the future."

### 7.2 Setup Complete Flow
- [ ] Enter: Subject = "Machine Learning", Exam Date = 7 days from now
- [ ] Click Next → Step 2 (Syllabus Upload) — skip if no file
- [ ] Click Next → Step 3 (PYQ Upload) — skip if no file
- [ ] Click "Generate Roadmap"
- [ ] **Expected:** Toast: "Your rescue plan is ready!"
- [ ] **Expected:** Exam roadmap appears with real topics (not hardcoded OS topics)
- [ ] **Expected:** "N Days Left" badge shows correct count

### 7.3 Day-by-Day Timeline
- [ ] After setup, check the right panel
- [ ] **Expected:** Real rescue plan days (not hardcoded "Day 1 - CPU Scheduling")

---

## 8. Profile

### 8.1 Real User Data
- [ ] Navigate to `/profile`
- [ ] **Expected:** Shows your real name and email (not "Alex Mercer")
- [ ] **Expected:** Explanation level shows what you set during onboarding

### 8.2 Heatmap
- [ ] After studying a topic, check the heatmap
- [ ] **Expected:** Today's square is highlighted (real study activity, not Math.sin() fake data)

### 8.3 Change Explanation Level
- [ ] Click "Change" next to Explanation Level
- [ ] **Expected:** Level cycles: beginner → intermediate → advanced → beginner
- [ ] **Expected:** Toast: "Explanation level changed to intermediate"
- [ ] Refresh the page
- [ ] **Expected:** Level persists (saved to backend)

### 8.4 Change Exam Date
- [ ] Click "Change" next to Exam Date
- [ ] Set a new date, click "Save"
- [ ] **Expected:** Date updates, toast: "Exam date updated!"

### 8.5 Logout
- [ ] Click "Logout"
- [ ] **Expected:** Redirected to landing page `/`
- [ ] Try to navigate to `/dashboard` directly
- [ ] **Expected:** Redirected to `/` (not allowed in)

---

## 9. Error Handling & Edge Cases

### 9.1 Backend Down (All Pages)
- [ ] Stop the backend server
- [ ] On Dashboard: **Expected:** Red inline error (not blank/white screen)
- [ ] On Roadmap: **Expected:** Inline error with Retry button
- [ ] On Quiz start: **Expected:** "Couldn't generate quiz..." with Retry

### 9.2 CORS / Network Error
- [ ] With backend down, try to login
- [ ] **Expected:** Toast: "Unable to reach NeuralNest servers. Check your internet connection."

### 9.3 Duplicate Registration
- [ ] Try to register with an already-registered email
- [ ] **Expected:** Error: "This email is already registered. Try logging in instead."

### 9.4 Invalid Token Injection
- [ ] Open DevTools → Local Storage → set `token` = `fake-invalid-token`
- [ ] Refresh the page
- [ ] **Expected:** Automatically logged out and redirected to `/`

### 9.5 Empty Sidebar (New User)
- [ ] Log in as new user, check sidebar
- [ ] **Expected:** Under each category: "No chats yet" + "Start a session" link (NOT blank space)

### 9.6 New Session Button
- [ ] Click "+ New Session" in sidebar
- [ ] **Expected:** Section picker popover appears: 📅 Exam / 🗺️ Roadmap / 💡 Other
- [ ] Select "Roadmap"
- [ ] **Expected:** Navigated to `/tutor/new` and chat created under Roadmap section

### 9.7 Upload Wrong File Type
- [ ] In onboarding, try to drag a .jpg file into the DropZone
- [ ] **Expected:** File rejected or error shown

### 9.8 Global Render Crash
- [ ] (Dev only) Temporarily throw an error in a component's render
- [ ] **Expected:** ErrorBoundary catches it and shows "Something unexpected happened" page with Try Again and Go Home buttons — NO white screen

### 9.9 Refresh Mid-Quiz
- [ ] Start a quiz, answer 3 questions, then refresh the page
- [ ] **Expected:** Quiz resets (questions re-generated) — not a broken blank state

---

## 10. Navigation & UI

### 10.1 All Nav Links Work
- [ ] Click each sidebar item: Dashboard, Roadmap, AI Tutor, Exam Mode, Active Quizzes
- [ ] **Expected:** All navigate correctly without errors

### 10.2 Back Buttons
- [ ] From Quiz → click back arrow → **Expected:** Back to Tutor
- [ ] From Tutor → click back arrow → **Expected:** Back to Roadmap

### 10.3 "Ask Doubt" in TopBar
- [ ] Click "Ask Doubt" button in the top bar
- [ ] **Expected:** Navigates to `/tutor/new` with empty chat

### 10.4 Avatar Click
- [ ] Click the user avatar in the top right
- [ ] **Expected:** Navigates to `/profile`

### 10.5 Dark/Light Mode Toggle
- [ ] Click the moon/sun toggle
- [ ] **Expected:** Theme switches on all pages without page reload

### 10.6 404 Page
- [ ] Navigate to `/nonexistent-page`
- [ ] **Expected:** Redirected to `/` (not a broken page)

---

## Test Results Log

| # | Test | Status | Notes |
|---|---|---|---|
| 1.1 | Register | ☐ | |
| 1.2 | Login | ☐ | |
| 1.3 | Google OAuth | ☐ | |
| 1.4 | GitHub OAuth | ☐ | |
| 1.5 | Session Restore | ☐ | |
| 1.6 | Token Expiry | ☐ | |
| 2.1 | PDF Upload | ☐ | |
| 2.2 | Paste Notes | ☐ | |
| 3.1 | Roadmap Real Data | ☐ | |
| 3.6 | Backend Down | ☐ | |
| 4.2 | SSE Streaming | ☐ | |
| 4.6 | Stream Failure | ☐ | |
| 5.1 | 10 Questions | ☐ | |
| 5.4 | Node Color Update | ☐ | |
| 6.1 | Dashboard Real Data | ☐ | |
| 6.2 | New User Empty State | ☐ | |
| 7.2 | Exam Setup | ☐ | |
| 8.3 | Explanation Level Save | ☐ | |
| 9.1 | Backend Down All Pages | ☐ | |
| 9.3 | Duplicate Email | ☐ | |
| 9.8 | Global Crash Boundary | ☐ | |
