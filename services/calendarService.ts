import { calendar_v3 } from "@googleapis/calendar";
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import * as path from "path";
import { TrashSchedule } from "../types";

interface CalendarConfig {
  calendarId: string;
}

export class CalendarService {
  private readonly calendar: calendar_v3.Calendar;
  private readonly calendarId: string;

  constructor(config: CalendarConfig) {
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, "../service-account.json"),
      scopes: ["https://www.googleapis.com/auth/calendar.events"],
    });
    this.calendar = google.calendar({ version: "v3", auth });
    this.calendarId = config.calendarId;
  }

  async createEvents(schedule: TrashSchedule): Promise<void> {
    // Define color mapping for each category
    const categoryColors: Record<string, string> = {
      bio: "10", // Green
      glass: "7", // Blue
      plastic: "6", // Orange
      mixed: "8", // Gray
      paper: "3", // Purple
    };

    for (const [category, dates] of Object.entries(schedule)) {
      for (const date of dates) {
        try {
          const eventSummary = `${category.toUpperCase()} - ${date}`;
          const existingEvents = await this.calendar.events.list({
            calendarId: this.calendarId,
            timeMin: `${date}T00:00:00Z`,
            timeMax: `${date}T23:59:59Z`,
            q: eventSummary, // Search for exact event summary
          });

          const event: calendar_v3.Schema$Event = {
            summary: eventSummary,
            start: { date },
            end: { date },
            colorId: categoryColors[category.toLowerCase()] || "1", // Default to "1" if category not found
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 24 * 60 }, // 1 day before
              ],
            },
            transparency: "transparent", // Show as free/available
          };

          await this.calendar.events.insert({
            calendarId: this.calendarId,
            requestBody: event,
          });
          console.log(`Created event for ${category} on ${date}`);
        } catch (error) {
          console.error(
            `Error creating event for ${category} on ${date}:`,
            error
          );
        }
      }
    }
  }

  async deleteAllEvents(): Promise<void> {
    try {
      // Get all events from the calendar
      const events = await this.calendar.events.list({
        calendarId: this.calendarId,
        // Get all events, no time restrictions
        timeMin: new Date(0).toISOString(), // From the beginning of time
        timeMax: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 365 * 10
        ).toISOString(), // 10 years from now
        maxResults: 2500, // Google Calendar API maximum
      });

      if (!events.data.items?.length) {
        console.log("No events found to delete");
        return;
      }

      // Delete each event
      for (const event of events.data.items) {
        if (!event.id) continue;

        await this.calendar.events.delete({
          calendarId: this.calendarId,
          eventId: event.id,
        });
        console.log(`Deleted event: ${event.summary} (${event.id})`);
      }

      console.log("All events have been deleted");
    } catch (error) {
      console.error("Error deleting events:", error);
      throw error;
    }
  }
}
