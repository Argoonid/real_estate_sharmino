-- ====================================================================
-- SHARMINO REAL ESTATE — ЧИСТАЯ ПРОДАКШЕН-РАЗВЕРТКА SUPABASE POSTGRESQL
-- ====================================================================

-- 1. РАСШИРЕНИЯ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ТАБЛИЦА РАЙОНОВ (DISTRICTS)
CREATE TABLE IF NOT EXISTS districts (
    id TEXT PRIMARY KEY,
    name_ru TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ОСНОВНАЯ ТАБЛИЦА ОБЪЕКТОВ НЕДВИЖИМОСТИ (PROPERTIES)
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY DEFAULT ('shm_' || substring(md5(random()::text), 1, 10)),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    deal TEXT NOT NULL DEFAULT 'sale', 
    type TEXT NOT NULL DEFAULT 'apartment',
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Новые поля для админ-панели
    is_admin_selected BOOLEAN NOT NULL DEFAULT false,
    admin_notes TEXT DEFAULT '',

    -- Стоимость
    price_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.0,
    price_currency TEXT NOT NULL DEFAULT 'EUR',
    price_egp_standard NUMERIC(16, 2) NOT NULL DEFAULT 0.0,
    is_price_on_request BOOLEAN NOT NULL DEFAULT false,
    deposit NUMERIC(14, 2) DEFAULT NULL,
    utilities TEXT NOT NULL DEFAULT 'excluded',

    -- Характеристики
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    area_sqm NUMERIC(8, 2) NOT NULL DEFAULT 60.0,
    floor INT DEFAULT 1,
    total_floors INT DEFAULT 3,
    view TEXT DEFAULT 'garden_view',
    is_furnished BOOLEAN NOT NULL DEFAULT true,
    has_balcony BOOLEAN NOT NULL DEFAULT true,
    has_garden BOOLEAN NOT NULL DEFAULT false,
    has_beach_access BOOLEAN NOT NULL DEFAULT false,
    amenities TEXT[] DEFAULT '{pool,security,parking,wifi,air_conditioning}',

    -- Локация
    district_id TEXT REFERENCES districts(id) ON DELETE SET NULL,
    compound_name TEXT DEFAULT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,

    -- Описание и фото
    description TEXT NOT NULL DEFAULT '',
    images TEXT[] NOT NULL DEFAULT '{}',

    -- Источник
    source_platform TEXT DEFAULT 'manual',
    source_external_id TEXT DEFAULT NULL,
    source_origin_url TEXT DEFAULT NULL,
    source_contact TEXT DEFAULT NULL,

    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ТАБЛИЦА ЗАЯВОК И БРОНИРОВАНИЙ (LEADS)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT DEFAULT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_telegram TEXT DEFAULT NULL,
    viewing_date DATE NOT NULL,
    viewing_time TEXT NOT NULL,
    viewing_type TEXT NOT NULL DEFAULT 'in_person',
    notes TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ИНДЕКСЫ ДЛЯ БЫСТРОГО ПОИСКА И ФИЛЬТРАЦИИ
CREATE INDEX IF NOT EXISTS idx_properties_active_deal ON properties (is_active, deal);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties (district_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_coords ON properties (lat, lng);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_admin_selected ON properties (is_admin_selected);

-- 6. НАСТРОЙКА БЕЗОПАСНОСТИ ROW LEVEL SECURITY (RLS)
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view districts" ON districts;
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
DROP POLICY IF EXISTS "Public can insert leads" ON leads;
DROP POLICY IF EXISTS "Admins full access to properties" ON properties;
DROP POLICY IF EXISTS "Admins full access to leads" ON leads;

CREATE POLICY "Public can view districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public can view active properties" ON properties FOR SELECT USING (is_active = true);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Admins full access to properties" ON properties
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
    
CREATE POLICY "Admins full access to leads" ON leads
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 7. БАЗОВЫЕ РАЙОНЫ
INSERT INTO districts (id, name_ru, name_en, slug, lat, lng) VALUES
('hadaba', 'Хадаба', 'Hadaba', 'hadaba', 27.863000, 34.315000),
('naama_bay', 'Наама Бей', 'Naama Bay', 'naama-bay', 27.915800, 34.329900),
('sharks_bay', 'Шаркс Бей', 'Sharks Bay', 'sharks-bay', 27.954000, 34.390000),
('nabq_bay', 'Набк Бей', 'Nabq Bay', 'nabq-bay', 28.035000, 34.435000),
('montazah', 'Монтаза и Рас Насрани', 'Montazah & Ras Nasrani', 'montazah', 27.985000, 34.425000),
('pasha_coast', 'Паша Кост и Тауэр', 'Pasha Coast & Tower', 'pasha-coast', 27.925000, 34.350000),
('domina_coral', 'Домина Корал Бэй', 'Domina Coral Bay', 'domina-coral', 27.935000, 34.365000),
('delta_sharm', 'Дельта Шарм', 'Delta Sharm Resort', 'delta-sharm', 27.880000, 34.305000),
('old_market', 'Старый город и Шарм-эль-Майя', 'Old Market & Sharm El Maya', 'old-market', 27.868000, 34.298000)
ON CONFLICT (id) DO UPDATE SET
    name_ru = EXCLUDED.name_ru,
    name_en = EXCLUDED.name_en,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng;