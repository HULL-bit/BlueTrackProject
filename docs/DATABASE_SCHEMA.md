# 🗄️ Schéma de Base de Données - Pirogue Connect

## Vue d'Ensemble

La base de données **`pirogue_connect`** utilise PostgreSQL avec l'extension PostGIS pour les données géospatiales.

## 📊 Tables Principales

### 1. `users` - Authentification
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'fisherman',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Rôles disponibles :**
- `fisherman` - Pêcheur
- `organization` - Organisation (GIE)
- `admin` - Administrateur

### 2. `user_profiles` - Profils Utilisateurs
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    boat_name VARCHAR(100),
    license_number VARCHAR(50),
    emergency_contact VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `boats` - Informations Pirogues
```sql
CREATE TABLE boats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    boat_type boat_type DEFAULT 'pirogue',
    length_meters DECIMAL(5,2),
    capacity_persons INTEGER,
    engine_power_hp INTEGER,
    gps_device_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `locations` - Positions GPS
```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
    position GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed_knots DECIMAL(5,2) DEFAULT 0,
    heading_degrees INTEGER DEFAULT 0,
    altitude_meters DECIMAL(8,2),
    accuracy_meters DECIMAL(8,2),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. `zones` - Zones Maritimes
```sql
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone_type zone_type NOT NULL,
    polygon_coordinates GEOGRAPHY(POLYGON, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Types de zones :**
- `safety` - Zone de sécurité
- `fishing` - Zone de pêche
- `restricted` - Zone restreinte
- `emergency` - Zone d'urgence

### 6. `alerts` - Système d'Alertes
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity alert_severity DEFAULT 'medium',
    status alert_status DEFAULT 'active',
    location_id UUID REFERENCES locations(id),
    zone_id UUID REFERENCES zones(id),
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. `messages` - Communication
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(100),
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    location_id UUID REFERENCES locations(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. `trips` - Sorties en Mer
```sql
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
    start_location_id UUID REFERENCES locations(id),
    end_location_id UUID REFERENCES locations(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    distance_km DECIMAL(8,2),
    max_speed_knots DECIMAL(5,2),
    avg_speed_knots DECIMAL(5,2),
    fuel_consumed_liters DECIMAL(6,2),
    catch_weight_kg DECIMAL(8,2),
    notes TEXT,
    status trip_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Sécurité RLS (Row Level Security)

### Politiques de Sécurité

```sql
-- Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Les organisations peuvent voir tous les pêcheurs
CREATE POLICY "Organizations can view all fishermen" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('organization', 'admin')
        )
    );

-- Locations visibles selon le rôle
CREATE POLICY "Location access by role" ON locations
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('organization', 'admin')
        )
    );
```

## 📈 Index et Performance

### Index Géospatiaux
```sql
-- Index spatial pour les positions
CREATE INDEX idx_locations_position ON locations USING GIST (position);

-- Index spatial pour les zones
CREATE INDEX idx_zones_polygon ON zones USING GIST (polygon_coordinates);

-- Index temporel pour les locations
CREATE INDEX idx_locations_timestamp ON locations (timestamp DESC);
```

### Index Standards
```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_alerts_status ON alerts (status);
CREATE INDEX idx_messages_channel ON messages (channel_id);
CREATE INDEX idx_trips_user_time ON trips (user_id, start_time DESC);
```

## 🔄 Triggers et Fonctions

### Mise à Jour Automatique des Timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer aux tables concernées
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Validation Géospatiale
```sql
CREATE OR REPLACE FUNCTION validate_zone_polygon()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le polygone est valide
    IF NOT ST_IsValid(NEW.polygon_coordinates::geometry) THEN
        RAISE EXCEPTION 'Invalid polygon geometry';
    END IF;
    
    -- Vérifier que le polygone n'est pas trop grand (max 100km²)
    IF ST_Area(NEW.polygon_coordinates::geometry::geography) > 100000000 THEN
        RAISE EXCEPTION 'Zone too large (max 100km²)';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 📊 Vues Utiles

### Vue des Positions Actuelles
```sql
CREATE VIEW current_positions AS
SELECT DISTINCT ON (user_id)
    l.user_id,
    u.username,
    up.full_name,
    up.boat_name,
    l.latitude,
    l.longitude,
    l.speed_knots,
    l.heading_degrees,
    l.timestamp
FROM locations l
JOIN users u ON l.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = true
ORDER BY user_id, timestamp DESC;
```

### Vue des Alertes Actives
```sql
CREATE VIEW active_alerts AS
SELECT 
    a.*,
    u.username,
    up.full_name,
    l.latitude,
    l.longitude
FROM alerts a
JOIN users u ON a.user_id = u.id
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.status = 'active'
ORDER BY a.created_at DESC;
```

## 🔧 Maintenance

### Nettoyage Automatique
```sql
-- Supprimer les anciennes positions (> 30 jours)
DELETE FROM locations 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Archiver les anciens messages (> 90 jours)
DELETE FROM messages 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Statistiques
```sql
-- Statistiques d'utilisation
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'fisherman' THEN 1 END) as fishermen,
    COUNT(CASE WHEN role = 'organization' THEN 1 END) as organizations,
    COUNT(CASE WHEN is_active THEN 1 END) as active_users
FROM users;
```