import fetch from "node-fetch";
import { TrashSchedule } from "../types";

interface TrashScheduleConfig {
  id_numeru: string;
  id_ulicy: string;
}

export class TrashScheduleService {
  private readonly baseUrl =
    "https://ekosystem.wroc.pl/wp-admin/admin-ajax.php";
  private readonly config: TrashScheduleConfig;

  constructor(config: TrashScheduleConfig) {
    this.config = config;
  }

  async fetchSchedule(): Promise<TrashSchedule> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "waste_disposal_form_get_schedule_direct",
        id_numeru: this.config.id_numeru,
        id_ulicy: this.config.id_ulicy,
      }),
    });

    const responseText = await response.text();
    return this.parseSchedule(responseText);
  }

  private parseSchedule(response: string): TrashSchedule {
    const jsonData = JSON.parse(response);
    const tableContent = jsonData.wiadomoscRWD;

    const schedule: TrashSchedule = {
      bio: [],
      glass: [],
      plastic: [],
      mixed: [],
      paper: [],
    };

    const rows = tableContent.match(
      /<tr><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><\/tr>/g
    );

    if (rows) {
      rows.forEach((row: string) => {
        const dates = row.match(/\d{4}-\d{2}-\d{2}/g);
        if (dates) {
          dates.forEach((date: string, index: number) => {
            if (date) {
              switch (index) {
                case 0:
                  schedule.bio.push(date);
                  break;
                case 1:
                  if (date !== "") schedule.glass.push(date);
                  break;
                case 2:
                  if (date !== "") schedule.plastic.push(date);
                  break;
                case 3:
                  if (date !== "") schedule.mixed.push(date);
                  break;
                case 4:
                  if (date !== "") schedule.paper.push(date);
                  break;
              }
            }
          });
        }
      });
    }

    return schedule;
  }
}
