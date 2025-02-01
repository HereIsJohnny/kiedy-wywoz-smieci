-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Addresses table to store location information
CREATE TABLE addresses(
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_numeru varchar NOT NULL,
    id_ulicy varchar NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Calendars table as the main entity
CREATE TABLE calendars(
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    google_calendar_id varchar NOT NULL UNIQUE,
    address_id uuid REFERENCES addresses(id),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Subscribers table to store emails
CREATE TABLE subscribers(
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email varchar NOT NULL,
    calendar_id uuid REFERENCES calendars(id),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    UNIQUE (email, calendar_id)
);

-- Optional: Events table if you decide to store them
CREATE TABLE events(
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    calendar_id uuid REFERENCES calendars(id),
    google_event_id varchar NOT NULL,
    title varchar NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_calendars_address_id ON calendars(address_id);

CREATE INDEX idx_subscribers_calendar_id ON subscribers(calendar_id);

CREATE INDEX idx_events_calendar_id ON events(calendar_id);

-- Enable Row Level Security (RLS)
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

