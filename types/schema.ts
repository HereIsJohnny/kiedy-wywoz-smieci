export type Address = {
  id: string;
  id_numeru: string;
  id_ulicy: string;
  created_at: string;
  updated_at: string;
};

export type Calendar = {
  id: string;
  google_calendar_id: string;
  address_id: string;
  created_at: string;
  updated_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  calendar_id: string;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  calendar_id: string;
  google_event_id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: Address;
        Insert: Omit<Address, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Address, "id">>;
      };
      calendars: {
        Row: Calendar;
        Insert: Omit<Calendar, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Calendar, "id">>;
      };
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscriber, "id">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Event, "id">>;
      };
    };
  };
};
