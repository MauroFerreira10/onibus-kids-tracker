-- Create stop_arrivals table
CREATE TABLE IF NOT EXISTS stop_arrivals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stop_id UUID NOT NULL REFERENCES stops(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    arrival_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('arrived', 'departed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stop_arrivals_stop_id ON stop_arrivals(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_arrivals_vehicle_id ON stop_arrivals(vehicle_id);

-- Add RLS policies
ALTER TABLE stop_arrivals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON stop_arrivals
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON stop_arrivals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add function to notify when bus arrives at stop
CREATE OR REPLACE FUNCTION notify_bus_arrival()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'bus_arrival',
        json_build_object(
            'stop_id', NEW.stop_id,
            'vehicle_id', NEW.vehicle_id,
            'arrival_time', NEW.arrival_time,
            'status', NEW.status
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER on_bus_arrival
    AFTER INSERT ON stop_arrivals
    FOR EACH ROW
    EXECUTE FUNCTION notify_bus_arrival(); 