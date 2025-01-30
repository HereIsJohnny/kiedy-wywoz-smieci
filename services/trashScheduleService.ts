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
      /<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g
    );

    console.log(rows);

    if (rows) {
      rows.forEach((row: string) => {
        // Extract all cell contents, including d empty ones
        const cells =
          row.match(/<td>([^<]*)<\/td>/g)?.map((cell) => {
            const dateMatch = cell.match(/\d{4}-\d{2}-\d{2}/);
            return dateMatch ? dateMatch[0] : "";
          }) || [];

        // Add dates to their respective categories based on column position
        if (cells[0]) schedule.bio.push(cells[0]);
        if (cells[1]) schedule.glass.push(cells[1]);
        if (cells[2]) schedule.plastic.push(cells[2]);
        if (cells[3]) schedule.mixed.push(cells[3]);
        if (cells[4]) schedule.paper.push(cells[4]);
      });
    }

    return schedule;
  }
}
