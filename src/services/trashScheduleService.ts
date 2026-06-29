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

    console.log(tableContent);

    const schedule: TrashSchedule = {
      bio: [],
      glass: [],
      plastic: [],
      mixed: [],
      paper: [],
    };

    // Extract the header row to determine column order
    const headerMatch = tableContent.match(/<thead><tr>(.*?)<\/tr><\/thead>/s);
    if (!headerMatch) {
      console.error("Could not find table headers");
      return schedule;
    }

    // Extract header cells and map them to waste types
    const headerCells = headerMatch[1].match(/<th[^>]*>(.*?)<\/th>/g) || [];
    const columnMap: Record<number, keyof TrashSchedule> = {};

    headerCells.forEach((cell: string, index: number) => {
      const headerText = cell
        .replace(/<[^>]*>/g, "")
        .trim()
        .toLowerCase();

      if (headerText.includes("bio")) {
        columnMap[index] = "bio";
      } else if (headerText.includes("papier")) {
        columnMap[index] = "paper";
      } else if (headerText.includes("zmieszane")) {
        columnMap[index] = "mixed";
      } else if (headerText.includes("szkło") || headerText.includes("szklo")) {
        columnMap[index] = "glass";
      } else if (headerText.includes("tworzywa")) {
        columnMap[index] = "plastic";
      }
    });

    console.log("Column mapping based on headers:", columnMap);

    // Extract data rows
    const rows = tableContent.match(
      /<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g
    );

    if (rows) {
      rows.forEach((row: string) => {
        // Extract all cell contents
        const cells =
          row.match(/<td>([^<]*)<\/td>/g)?.map((cell) => {
            const dateMatch = cell.match(/\d{4}-\d{2}-\d{2}/);
            return dateMatch ? dateMatch[0] : "";
          }) || [];

        // Map each cell to its corresponding category based on the column mapping
        cells.forEach((date, index) => {
          if (date && columnMap[index]) {
            schedule[columnMap[index]].push(date);
          }
        });
      });
    }

    return schedule;
  }
}
