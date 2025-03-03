import "dotenv/config";

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
    calendarId: process.env.CALENDAR_ID || "",
  },
  trash: {
    id_numeru: process.env.TRASH_ID_NUMERU || "",
    id_ulicy: process.env.TRASH_ID_ULICY || "",
  },
};
