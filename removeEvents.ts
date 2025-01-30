import { CalendarService } from "./services/calendarService";
import { config } from "./config";

async function main() {
  const calendarService = new CalendarService(config.calendar);

  try {
    await calendarService.deleteAllEvents();
    console.log("Calendar events deleted successfully");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

main();
