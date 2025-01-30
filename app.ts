import { TrashScheduleService } from "./services/trashScheduleService";
import { CalendarService } from "./services/calendarService";
import { config } from "./config";

async function main() {
  const trashService = new TrashScheduleService(config.trash);
  const calendarService = new CalendarService(config.calendar);

  try {
    const schedule = await trashService.fetchSchedule();
    console.log("Previous events deleted");
    await calendarService.deleteAllEvents();
    await calendarService.createEvents(schedule);
    console.log("Calendar events created successfully");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

main();
