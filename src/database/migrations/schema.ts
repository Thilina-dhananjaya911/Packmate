export const DATABASE_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_type TEXT NOT NULL DEFAULT 'General',
  departure_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  trip_duration INTEGER NOT NULL DEFAULT 1,
  trip_type TEXT NOT NULL,
  traveller_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Ongoing', 'Completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS packing_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  trip_type TEXT NOT NULL,
  destination_type TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  recommended_duration TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS template_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  default_quantity INTEGER NOT NULL DEFAULT 1,
  is_essential INTEGER NOT NULL DEFAULT 1,
  scaling_rule TEXT NOT NULL DEFAULT 'fixed',
  per_traveller INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (template_id) REFERENCES packing_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS packing_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_packed INTEGER NOT NULL DEFAULT 0,
  is_essential INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_packing_items_trip ON packing_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_packing_items_category ON packing_items(category_id);
CREATE INDEX IF NOT EXISTS idx_template_items_template ON template_items(template_id);
`;
