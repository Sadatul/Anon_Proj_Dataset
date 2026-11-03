# Bug Injection Log

## Summary

This document tracks intentional bug injections made for validation/testing of bug detection tooling.

## Injected Bugs

1. Create Volunteer Opportunity image no longer required.
2. Delete in Space Logs no longer calls backend delete API, but UI still removes the item.
3. Volunteer application submit no longer calls backend request API.
4. Signup no longer requires image URL, and failed signup requests no longer show user-facing error messages.

## Modified Files

- `src/pages/AddVolunteer/AddVolunteer.jsx`
  - Removed image requirement from step-level and final submit validation.
  - Original validation logic kept in comments for rollback.

- `src/pages/MyPosts/MyVolunteerNeedPost.jsx`
  - Removed delete API call from delete flow while keeping optimistic UI removal and success alert.
  - Original API call/import kept in comments for rollback.

- `src/components/Volunteer/VolunteerRequestModal.jsx`
  - Removed backend API submission call for volunteer requests.
  - Original API import/call kept in comments for rollback.

- `src/Auth/Register.jsx`
  - Removed photo URL required validation during signup.
  - Suppressed user-facing error message in signup failure path.
  - Original validation and error UI blocks kept in comments for rollback.

## Previous BUGS

1. UI Breaks for long Volunteer Opportunity Title
2. Create Volunteer Opportunity accepts negative number for required volunteers
3. Registration deadline for opportunity can exceed the end date
4. Edit Profile doesn't update user information in the backend
5. Broken Navigation Links for Resources

## User Story

Kind Hands enables two core user roles: volunteers looking for causes to support and organizers managing community opportunities.

As a new user, I can sign up, log in, and access a personalized dashboard. From there, I can set up my profile, track my activity, and navigate quickly to key modules like opportunities, requests, and account settings.

As an organizer, I can create volunteer opportunities using a multi-step form with details such as title, category, location, volunteer count, and schedule dates. I can review my created posts in the Space Logs area, edit post details, and remove outdated opportunities.

As a volunteer, I can browse and search opportunities, open a dedicated details page, review organizer and event information, and submit a volunteer application with optional notes. I can also monitor my submitted requests from my dashboard.

Across all pages, the experience is designed for responsive use on desktop and mobile, with clear navigation, feedback dialogs, and streamlined form workflows for fast task completion.
