import { calendar_v3 } from "@googleapis/calendar";
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import * as path from "path";
import { TrashSchedule } from "../types";

interface CalendarConfig {
  calendarId?: string;
  calendarName?: string;
}

interface ShareCalendarOptions {
  email: string;
  role?: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
  sendNotification?: boolean;
}

export class CalendarService {
  private calendar: calendar_v3.Calendar;
  private calendarId: string | null;

  constructor(config: CalendarConfig) {
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const auth = new GoogleAuth({
      keyFile: path.join(__dirname, "../service-account.json"),
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });
    this.calendar = google.calendar({ version: "v3", auth });
    this.calendarId = config.calendarId || null;
  }

  async createCalendar(name: string): Promise<string> {
    try {
      const calendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: name,
          timeZone: "Europe/Warsaw",
        },
      });

      if (!calendar.data.id) {
        throw new Error("Failed to create calendar - no ID returned");
      }

      this.calendarId = calendar.data.id;
      return calendar.data.id;
    } catch (error) {
      console.error("Error creating calendar:", error);
      throw error;
    }
  }

  async createEvents(schedule: TrashSchedule): Promise<void> {
    if (!this.calendarId) {
      throw new Error(
        "Calendar ID not set. Please create or specify a calendar first."
      );
    }

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
    if (!this.calendarId) {
      throw new Error(
        "Calendar ID not set. Please create or specify a calendar first."
      );
    }

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

  setCalendarId(calendarId: string): void {
    this.calendarId = calendarId;
  }

  getCalendarId(): string | null {
    return this.calendarId;
  }

  async shareCalendar(options: ShareCalendarOptions): Promise<void> {
    if (!this.calendarId) {
      throw new Error(
        "Calendar ID not set. Please create or specify a calendar first."
      );
    }

    try {
      const rule = {
        role: options.role || "reader",
        scope: {
          type: "user",
          value: options.email,
        },
      };

      await this.calendar.acl.insert({
        calendarId: this.calendarId,
        requestBody: rule,
        sendNotifications: options.sendNotification ?? true,
      });

      console.log(`Calendar shared with ${options.email} as ${rule.role}`);
    } catch (error) {
      console.error(`Error sharing calendar with ${options.email}:`, error);
      throw error;
    }
  }

  async removeCalendarAccess(email: string): Promise<void> {
    if (!this.calendarId) {
      throw new Error(
        "Calendar ID not set. Please create or specify a calendar first."
      );
    }

    try {
      // First, find the rule ID for this email
      const aclList = await this.calendar.acl.list({
        calendarId: this.calendarId,
      });

      const rule = aclList.data.items?.find(
        (item) => item.scope?.value === email
      );

      if (!rule || !rule.id) {
        throw new Error(`No access rule found for ${email}`);
      }

      // Remove the access rule
      await this.calendar.acl.delete({
        calendarId: this.calendarId,
        ruleId: rule.id,
      });

      console.log(`Calendar access removed for ${email}`);
    } catch (error) {
      console.error(`Error removing calendar access for ${email}:`, error);
      throw error;
    }
  }
}
