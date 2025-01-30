export interface Config {
  calendar: {
    calendarId: string;
  };
  trash: {
    id_numeru: string;
    id_ulicy: string;
  };
}

export const config: Config = {
  calendar: {
    calendarId: "your_calendar_id_here", // Get this from your Google Calendar settings
  },
  trash: {
    // These IDs can be found in the URL when selecting your address at https://ekosystem.wroc.pl
    id_numeru: "your_house_number_id",
    id_ulicy: "your_street_id",
  },
};
