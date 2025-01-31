import { TrashScheduleService } from "./services/trashScheduleService";
import { CalendarService } from "./services/calendarService";
import { configs, Config } from "./config";

async function main(config: Config) {
  const trashService = new TrashScheduleService(config.address);
  const calendarService = new CalendarService(config.calendar);

  try {
    const schedule = await trashService.fetchSchedule();
    await calendarService.deleteAllEvents();
    console.log("Previous events deleted");
    await calendarService.createEvents(schedule);
    console.log("Calendar events created successfully");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

configs.forEach((config) => {
  main(config);
});
