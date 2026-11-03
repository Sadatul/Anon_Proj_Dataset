# Bug Injection README

This document lists the intentionally injected regressions and modified files.

## Injected Bugs

1. No toast on invalid login
- Behavior: failed signin no longer shows `toast.error`.
- File: `frontend/src/screens/SigninScreen.js`
- Change marker: `BUG INJECTION: intentionally suppress invalid login feedback.`

2. Large product names overflow
- Behavior: long product titles do not wrap and can overflow card bounds.
- Files:
  - `frontend/src/components/Product.js`
  - `frontend/src/index.css`
- Change markers:
  - `className="product-title-overflow"`
  - `.product-title-overflow { white-space: nowrap; overflow: visible; }`

3. Broken search filter
- Behavior: price filter links no longer apply because wrong query key is used.
- File: `frontend/src/screens/SearchScreen.js`
- Change marker: `BUG INJECTION: wrong query key keeps price filter from applying.`

4. Wrong cart subtotal
- Behavior: subtotal ignores quantity and sums only product prices.
- File: `frontend/src/screens/CartScreen.js`
- Change marker: `BUG INJECTION: subtotal intentionally ignores quantity.`

5. Product Updated returned while one field is not persisted
- Behavior: product update returns success but `countInStock` edits are not saved.
- File: `backend/routes/productRoutes.js`
- Change marker: `BUG INJECTION: intentionally do not persist stock edits.`

6. Delete user does not persist
- Behavior: user is removed from UI immediately but reappears after refresh/fetch because API delete is skipped.
- File: `frontend/src/screens/UserListScreen.js`
- Change markers:
  - Added reducer action: `DELETE_LOCAL`
  - Commented out `axios.delete(...)`

7. Optimistic review update without API call
- Behavior: submitting a review updates UI and shows success, but nothing is persisted server-side.
- File: `frontend/src/screens/ProductScreen.js`
- Change marker: `BUG INJECTION: optimistic review update without calling API.`

8. Edit product with string price shows success toast
- Behavior: entering non-numeric price shows success and navigates away instead of error.
- File: `frontend/src/screens/ProductEditScreen.js`
- Change marker: `BUG INJECTION: invalid string price shows success instead of error.`

## Rollback Notes

Most modified sections include commented original logic immediately above or below injected code with `BUG INJECTION` markers for quick revert.

## Modified Files Summary

- `frontend/src/screens/SigninScreen.js`
- `frontend/src/components/Product.js`
- `frontend/src/index.css`
- `frontend/src/screens/SearchScreen.js`
- `frontend/src/screens/CartScreen.js`
- `backend/routes/productRoutes.js`
- `frontend/src/screens/UserListScreen.js`
- `frontend/src/screens/ProductScreen.js`
- `frontend/src/screens/ProductEditScreen.js`
- `BUG_INJECTION_README.md`

## Feature-Centric User Story

### User Story

As a shopper and storefront administrator, I want authentication, catalog browsing, search filtering, cart calculations, product management, user management, and product reviews to work consistently and persist across sessions, so that I can confidently shop, manage inventory, moderate users, and trust that every successful action is accurately reflected in both the UI and backend data.

The storefront experience should provide clear and trustworthy feedback at every step of the user journey. During authentication, users should immediately understand the result of a sign-in attempt: unsuccessful attempts should return clear guidance, while successful attempts should transition the user into the authorized flow without ambiguity.

Across the product catalog, listing cards should remain visually stable and readable regardless of product title length, preserving layout integrity on different screen sizes and maintaining a polished browsing experience. Search behavior should be equally dependable, with selected price filters correctly reflected in query parameters and results that remain consistent after refreshes, navigation, and shared URLs.

Cart behavior should always represent real purchase intent by calculating subtotal values using item quantities and prices together, with totals that remain consistent through checkout. In the admin experience, product updates should persist completely, including inventory-related fields, and any successful update response should accurately represent stored backend state. Input validation should prevent invalid values for numeric fields such as price, and validation feedback should be explicit enough to help admins correct mistakes before saving.

User administration should ensure that delete operations are truly persisted, so removed users do not reappear after reload or refetch. Product review submission should likewise be persistence-first: review entries and rating aggregates should only be presented as successful once they are stored through the API, and the resulting state should be consistently visible across reloads and other clients.
