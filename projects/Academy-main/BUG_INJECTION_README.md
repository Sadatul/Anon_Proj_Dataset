# Bug Injection README

This document lists the intentionally injected frontend defects in Academy. Each one is marked in the source with a `// BUG (intentional):` comment.

## Injected Bugs

1. Wrong password causes a "spin of death"
- File: `frontend/src/components/Login.js`
- Behavior: after a failed login, a spinner shows briefly and then the form resets without any error message.

2. Duplicate email dead-ends signup
- File: `frontend/src/components/Signup.js`
- Behavior: if the email is already taken, the submit button is disabled and no error is shown.

3. Admin profile edits are not persisted
- Files: `frontend/src/components/Profile.js`, `frontend/src/components/SmartProfile.js`
- Behavior: when an admin edits their bio or phone, a success toast appears but no API call is made.

4. Course deletion is not persisted
- File: `frontend/src/components/ModernAdminDashboard.js`
- Behavior: the course is removed from the UI and a success message is shown, but the backend delete endpoint is never called. Using the search bar brings the course back.

5. Teacher assignment is not preselected in the edit modal
- File: `frontend/src/components/CourseManagement.js`
- Behavior: the assigned teacher shows on the course card, but the teacher dropdown in the edit modal is always empty.

6. Enrollment request status is local-only (student dashboard)
- Files: `frontend/src/components/ModernStudentDashboard.js`, `frontend/src/components/StudentDashboard.js`
- Behavior: after a student requests enrollment, a "Pending Approval" badge is shown from local state only. Navigating away and back resets it to "Enroll", even though the request was saved on the backend.

7. Past-date assignment deadline blocks creation silently
- File: `frontend/src/components/AssignmentManagement.js`
- Behavior: with a deadline in the past, clicking "Create" does nothing, and the inline validation message is suppressed.

8. Teacher marks are not persisted
- File: `frontend/src/components/AssessmentGrid.js`
- Behavior: teacher marks show as "saved", but they're never sent to the backend. Refreshing the page reverts them.

9. Attendance "Select All" is visual only
- File: `frontend/src/components/AttendanceManagement.js`
- Behavior: bulk toggles turn the switches green, but don't update the records that Save sends. Saved attendance stays unchanged.

10. Discussion reply is not persisted
- File: `frontend/src/components/DiscussionThreadDetail.js`
- Behavior: a reply is appended directly to the page, with no API call and no state update. Scrolling re-renders the list, which removes the reply.

11. Resource visibility toggle desyncs from saved value
- File: `frontend/src/components/ResourceEditModal.js`
- Behavior: if you toggle visibility off and then on again, the switch moves, but the value sent to the backend stays `false`.

## Modified Files

- `frontend/src/components/Login.js`
- `frontend/src/components/Signup.js`
- `frontend/src/components/Profile.js`
- `frontend/src/components/SmartProfile.js`
- `frontend/src/components/ModernAdminDashboard.js`
- `frontend/src/components/CourseManagement.js`
- `frontend/src/components/ModernStudentDashboard.js`
- `frontend/src/components/StudentDashboard.js`
- `frontend/src/components/AssignmentManagement.js`
- `frontend/src/components/AssessmentGrid.js`
- `frontend/src/components/AttendanceManagement.js`
- `frontend/src/components/DiscussionThreadDetail.js`
- `frontend/src/components/ResourceEditModal.js`
- `BUG_INJECTION_README.md`

To find every change, search for `BUG (intentional)` in `frontend/src`.
