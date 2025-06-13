-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create locales table to store supported locales
CREATE TABLE locales (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add some initial locales
INSERT INTO locales (code, name) VALUES
    ('en', 'English'),
    ('es', 'Spanish'),
    ('fr', 'French'),
    ('de', 'German'),
    ('it', 'Italian');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create translation_keys table
CREATE TABLE translation_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, key)
);

-- Create translation_values table to store individual translations
CREATE TABLE translation_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    translation_key_id UUID NOT NULL REFERENCES translation_keys(id) ON DELETE CASCADE,
    locale_code TEXT NOT NULL REFERENCES locales(code) ON DELETE CASCADE,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by TEXT NOT NULL,
    UNIQUE(translation_key_id, locale_code)
);

-- Create indexes for better query performance
CREATE INDEX idx_translation_keys_project ON translation_keys(project_id);
CREATE INDEX idx_translation_keys_category ON translation_keys(category);
CREATE INDEX idx_translation_values_key_locale ON translation_values(translation_key_id, locale_code);

-- Add trigger for translation_keys updated_at
CREATE TRIGGER update_translation_keys_updated_at
    BEFORE UPDATE ON translation_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for translation_values updated_at
CREATE TRIGGER update_translation_values_updated_at
    BEFORE UPDATE ON translation_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 