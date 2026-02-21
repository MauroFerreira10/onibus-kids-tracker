-- Add route_id column to stop_arrivals table
ALTER TABLE stop_arrivals
ADD COLUMN route_id UUID REFERENCES routes(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_stop_arrivals_route_id ON stop_arrivals(route_id);

-- Update the notify_bus_arrival function to include route_id
CREATE OR REPLACE FUNCTION notify_bus_arrival()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'bus_arrival',
        json_build_object(
            'stop_id', NEW.stop_id,
            'vehicle_id', NEW.vehicle_id,
            'route_id', NEW.route_id,
            'arrival_time', NEW.arrival_time,
            'status', NEW.status
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 