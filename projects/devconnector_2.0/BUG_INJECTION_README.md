# Bug Injection Notes (Frontend Only)

This document describes intentionally injected frontend bugs and where they were added.
All original lines were commented out near each change for easy rollback.

## Injected Bugs

1. Removed password and confirm-password matching validation on register
- File: `client/src/components/auth/Register.js`
- Change: Removed the `password !== password2` validation gate and always call `register(...)`.
- Rollback: Uncomment the original validation block and remove the direct register call.

2. Removed delete post API call (optimistic UI delete only)
- File: `client/src/actions/post.js`
- Change: Commented out `await api.delete(`/posts/${id}`)` in `deletePost`.
- Result: Post disappears from current UI state but reappears after refresh.
- Rollback: Uncomment the API call.

3. Removed add education API call
- File: `client/src/actions/profile.js`
- Change: Commented out `await api.put('/profile/education', formData)` and replaced with local `res = { data: null }`.
- Result: UI flow can show success while backend is not updated.
- Rollback: Uncomment the API call and remove the local stub.

4. Removed API call for edit profile
- File: `client/src/actions/profile.js`
- Change: In `createProfile(formData, edit)`, when `edit === true`, API call is skipped and current store profile is reused.
- Result: Edit profile appears to succeed without persisting changes.
- Rollback: Restore unconditional `await api.post('/profile', formData)`.

5. Broke the detailed developer profile link
- File: `client/src/components/profiles/ProfileItem.js`
- Change: Route changed from `/profile/${_id}` to `/profiles/${_id}`.
- Result: View Profile button goes to wrong route.
- Rollback: Revert link path to `/profile/${_id}`.

6. Show wrong number on Discussion button
- File: `client/src/components/posts/PostItem.js`
- Change: Display count changed from `comments.length` to `comments.length + 2`.
- Result: Discussion badge shows an incorrect number.
- Rollback: Revert count expression to `comments.length`.

## Modified Files

- `client/src/components/auth/Register.js`
- `client/src/actions/post.js`
- `client/src/actions/profile.js`
- `client/src/components/profiles/ProfileItem.js`
- `client/src/components/posts/PostItem.js`
- `BUG_INJECTION_README.md`

## Feature-Centric User Story

A new developer arrives on DevConnector to build a professional presence, connect with other engineers, and participate in technical discussions. The journey begins with account creation, where the user signs up with their name, email address, and password in order to gain access to the platform. Registration is the first point of trust in the experience, setting the expectation that account setup is straightforward, secure, and welcoming for someone joining the community for the first time.

Once signed in, the developer moves into profile creation and editing. They provide the details that make their professional identity useful to others on the platform, including skills, biography, company, website, location, and social links. From there, they continue enriching the profile by adding education credentials to highlight academic background and qualifications. This profile-building flow is central to the application because it turns a basic account into a discoverable developer identity that other users can evaluate, follow, and engage with.

After completing their profile, the user explores the community directory to browse other developers. They scan profile cards, review summarized information, and use the View Profile action to open a more detailed profile page. On that detailed view, they expect to see a fuller picture of another developer's experience, education, and overall background. This discovery flow supports networking and helps users identify people with relevant technical interests, similar career paths, or complementary skills.

The experience then extends into community interaction through posts and discussions. A user can create or browse posts, read what others are sharing, and engage with the conversation around those topics. Each post acts as a hub for discussion, where users can gauge activity and decide whether to open a thread and participate. The discussion count on a post serves as a quick signal of engagement, helping users prioritize which conversations are active or worth exploring.

As part of managing their own content, the user also expects to control posts they no longer want visible in the feed. Deleting a post is part of normal content ownership and moderation within a social developer platform. Together, these features form a complete product journey: join the platform, build a credible profile, showcase educational background, discover other developers, view detailed profiles, participate in post discussions, and manage personal contributions over time.
