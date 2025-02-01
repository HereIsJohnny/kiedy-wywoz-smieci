import { CalendarDbService } from "../services/calendarDbService";

async function example() {
  const calendarService = new CalendarDbService();

  // Create a new calendar with address and subscribers
  const calendar = await calendarService.createCalendarWithAddress(
    "google_calendar_id_here",
    "40843",
    "1388",
    ["maciej.kowalski.mk@gmail.com"]
  );

  console.log("Created calendar:", calendar);

  // Get calendar with all related data
  const calendarWithData = await calendarService.getCalendarWithSubscribers(
    calendar.id
  );
  console.log("Calendar with data:", calendarWithData);

  // Update subscribers
  await calendarService.updateSubscribers(calendar.id, [
    "maciej.kowalski.mk@gmail.com",
    "another.email@example.com",
  ]);
}

example().catch(console.error);
