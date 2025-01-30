# Trashes

## Configuration

1. Copy `config.template.ts` to `config.ts`
2. Update the values in `config.ts` with your actual configuration
3. Make sure you have `service-account.json` in the root directory (you can obtain this from your Google Cloud Console by creating a service account and downloading its key file)
4. Create a dedicated Google Calendar and add the service account email (found in `service-account.json`) as an editor to grant it permission to modify the calendar

Note: Both `config.ts` and `service-account.json` are git-ignored for security reasons.
