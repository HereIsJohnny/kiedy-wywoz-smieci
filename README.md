# Trashes

## Configuration

1. Copy `.env.example` to `.env`
2. Update the values in `.env` with your actual configuration
3. Make sure you have `service-account.json` in the root directory (you can obtain this from your Google Cloud Console by creating a service account and downloading its key file)
4. Create a dedicated Google Calendar and add the service account email (found in `service-account.json`) as an editor to grant it permission to modify the calendar

Note: Both `.env` and `service-account.json` are git-ignored for security reasons.

## Environment Variables

The application uses the following environment variables:

- `CALENDAR_ID`: Your Google Calendar ID
- `TRASH_ID_NUMERU`: ID number for trash service
- `TRASH_ID_ULICY`: Street ID for trash service
