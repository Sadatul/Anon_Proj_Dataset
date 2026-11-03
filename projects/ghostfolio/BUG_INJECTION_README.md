# Bug Injection README

This document tracks intentionally injected frontend defects for evaluation and provides rollback guidance.

## Scope

The changes in this document affect the following areas:

- Accounts transfer dialog UX feedback
- Accounts totals and account management interactions
- Access token generation flow in user account access settings

## Injected Bugs

### 1) Transfer dialog allows same-account submit without explicit feedback

- Feature area: Transfer cash between accounts
- Behavior injected: same-account validator remains active, but submit stays enabled when required fields are filled and no inline user-facing error text is shown.
- File modified:
  - `apps/client/src/app/pages/accounts/transfer-balance/transfer-balance-dialog.html`
- Rollback hint:
  - Restore submit enablement checks to `transferBalanceForm.valid` and optionally add a `mat-error` tied to the form-level validator.
  - A rollback helper block is included in HTML comments near the `toAccount` field.

### 2) Wrong total cash balance is rendered in Accounts footer

- Feature area: Accounts summary totals
- Behavior injected: only the footer cash total display is intentionally calculated from an incorrect expression while row values stay unchanged.
- File modified:
  - `libs/ui/src/lib/accounts-table/accounts-table.component.html`
- Rollback hint:
  - Restore the original footer binding: `totalBalanceInBaseCurrency()`.
  - The original binding is included inline as a rollback helper comment.

### 3) Edit account flow does not call update API

- Feature area: Update account details from Accounts page
- Behavior injected: account update API calls are bypassed in the shared data service.
- File modified:
  - `libs/ui/src/lib/services/data.service.ts`
- Rollback hint:
  - Restore the original `http.put(...)` call in `putAccount(...)`.
  - The original implementation is commented out in place.

### 4) Delete account flow does not call delete API, but updates UI optimistically

- Feature area: Delete account from Accounts table actions
- Behavior injected: delete API calls are bypassed in the shared data service while the page still updates local UI optimistically.
- File modified:
  - `libs/ui/src/lib/services/data.service.ts`
  - `apps/client/src/app/pages/accounts/accounts-page.component.ts`
- Rollback hint:
  - Restore the original `http.delete(...)` call in `deleteAccount(...)`.
  - Optionally restore the original account-page delete pipeline.
  - The original implementations are commented out in place.

### 5) Generate access token flow does not call API

- Feature area: User account access token generation
- Behavior injected: token API call is skipped and a placeholder token is displayed.
- File modified:
  - `apps/client/src/app/components/user-account-access/user-account-access.component.ts`
- Rollback hint:
  - Restore the original `dataService.updateOwnAccessToken(...)` observable pipeline.
  - The original block is commented out in place.

## Files Modified

- `apps/client/src/app/pages/accounts/transfer-balance/transfer-balance-dialog.html`
- `apps/client/src/app/pages/accounts/accounts-page.component.ts`
- `libs/ui/src/lib/accounts-table/accounts-table.component.html`
- `libs/ui/src/lib/services/data.service.ts`
- `apps/client/src/app/components/user-account-access/user-account-access.component.ts`
- `BUG_INJECTION_README.md`

## Already Existing Bugs

1. Negative Account Balance can be set
2. Account title overflows
3. Changing language breaks the site

## Notes For Test Runs

- These changes are intentionally non-production.
- Rollback is designed to be quick by uncommenting preserved original logic.
- If you run automated tests, expect feature-level regressions in account persistence and token generation workflows.

## Feature-Centric User Story

As an authenticated investor using Ghostfolio, I want to manage my account operations from one coherent workflow so that I can maintain accurate portfolio records, move cash across accounts, and securely control access.

I can open the Accounts page, review each account and aggregated totals in my base currency, and use contextual actions to edit or remove account entries. When I update account metadata such as name, notes, exclusion status, platform, and cash balance, the system should keep the account list and summary information synchronized with the latest saved account state.

I can transfer available cash balance from one account to another in a guided dialog with clear field requirements and actionable feedback, ensuring I understand why an action can or cannot be completed before I submit.

From my Access settings area, I can generate a new security token after explicit confirmation, receive the token in a secure display dialog, and continue with account access management actions while preserving expected security behavior.

Across these features, I expect consistent form affordances, transparent status communication, and reliable data synchronization between what I do in the UI and what is stored as my account and access configuration.
