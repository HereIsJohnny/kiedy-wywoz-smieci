import { supabase } from "../lib/supabase";
import type { Address, Calendar, Subscriber } from "../types/schema";

export class CalendarDbService {
  async createCalendarWithAddress(
    googleCalendarId: string,
    idNumeru: string,
    idUlicy: string,
    emails: string[]
  ) {
    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .insert({ id_numeru: idNumeru, id_ulicy: idUlicy })
      .select()
      .single();

    if (addressError) throw addressError;

    const { data: calendar, error: calendarError } = await supabase
      .from("calendars")
      .insert({
        google_calendar_id: googleCalendarId,
        address_id: address.id,
      })
      .select()
      .single();

    if (calendarError) throw calendarError;

    const subscribersToInsert = emails.map((email) => ({
      email,
      calendar_id: calendar.id,
    }));

    const { error: subscribersError } = await supabase
      .from("subscribers")
      .insert(subscribersToInsert);

    if (subscribersError) throw subscribersError;

    return calendar;
  }

  async getCalendarWithSubscribers(calendarId: string) {
    const { data: calendar, error: calendarError } = await supabase
      .from("calendars")
      .select(
        `
                *,
                address:addresses(*),
                subscribers(*)
            `
      )
      .eq("id", calendarId)
      .single();

    if (calendarError) throw calendarError;
    return calendar;
  }

  async updateSubscribers(calendarId: string, emails: string[]) {
    // First delete existing subscribers
    const { error: deleteError } = await supabase
      .from("subscribers")
      .delete()
      .eq("calendar_id", calendarId);

    if (deleteError) throw deleteError;

    // Then insert new ones
    const subscribersToInsert = emails.map((email) => ({
      email,
      calendar_id: calendarId,
    }));

    const { error: insertError } = await supabase
      .from("subscribers")
      .insert(subscribersToInsert);

    if (insertError) throw insertError;
  }
}
