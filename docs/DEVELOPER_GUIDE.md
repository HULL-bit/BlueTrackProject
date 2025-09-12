# 📚 Guide Développeur - Pirogue Connect

## 🏗️ Architecture du Projet

### Vue d'ensemble
Pirogue Connect est une application React/TypeScript moderne utilisant Vite comme bundler et Supabase comme backend. L'application suit une architecture modulaire avec séparation claire des responsabilités.

```
src/
├── components/          # Composants React réutilisables
├── contexts/           # Contextes React (Auth, Data)
├── lib/               # Utilitaires et configuration
├── types/             # Définitions TypeScript
└── main.tsx           # Point d'entrée de l'application
```

## 🔧 Technologies Utilisées

### Frontend
- **React 18** - Framework UI avec hooks
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **React Leaflet** - Cartes interactives
- **Lucide React** - Icônes modernes

### Backend & Base de Données
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Base de données relationnelle
- **PostGIS** - Extension géospatiale
- **Row Level Security (RLS)** - Sécurité au niveau des lignes

### Outils de Développement
- **Vite** - Build tool rapide
- **ESLint** - Linting du code
- **Prettier** - Formatage automatique

## 🏛️ Architecture des Composants

### 1. Contextes (Contexts)

#### AuthContext
Gère l'authentification et les sessions utilisateur.

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}
```

**Fonctionnalités :**
- Authentification avec Supabase Auth
- Fallback vers authentification mock pour démo
- Gestion des sessions persistantes
- Mise à jour des profils utilisateur

#### DataContext
Gère toutes les données de l'application et les mises à jour temps réel.

```typescript
interface DataContextType {
  locations: Location[];
  alerts: Alert[];
  messages: Message[];
  weather: WeatherCondition | null;
  zones: Zone[];
  trips: Trip[];
  users: User[];
  // ... méthodes CRUD
}
```

**Fonctionnalités :**
- Synchronisation temps réel avec Supabase
- Gestion des données hors ligne
- Cache local pour les performances
- Subscriptions WebSocket pour les mises à jour

### 2. Composants Principaux

#### Dashboard
Tableau de bord adaptatif selon le rôle utilisateur.

**Rôles supportés :**
- **Pêcheur** : Statistiques personnelles, statut sortie, conditions météo
- **Organisation** : Vue d'ensemble flotte, alertes, gestion pêcheurs
- **Admin** : Métriques système, monitoring, configuration

#### MapView
Carte interactive avec géolocalisation temps réel.

**Fonctionnalités :**
- Affichage positions pirogues en temps réel
- Zones de sécurité/pêche/restriction
- Alertes d'urgence géolocalisées
- Légende interactive
- Popups informatifs détaillés

#### UserManagement
Interface de gestion des utilisateurs (Admin/Organisation).

**Fonctionnalités :**
- Ajout/modification/suppression utilisateurs
- Gestion des rôles et permissions
- Formulaires adaptatifs selon le type d'utilisateur
- Statistiques et filtres

#### ChatWidget
Widget de communication flottant.

**Fonctionnalités :**
- Canaux de communication multiples
- Messages temps réel
- Partage de géolocalisation
- Historique des conversations
- Notifications visuelles

#### EmergencyButton
Bouton d'urgence SOS avec géolocalisation.

**Fonctionnalités :**
- Countdown de sécurité (5 secondes)
- Géolocalisation automatique
- Création d'alerte critique
- Interface de confirmation

## 🗄️ Modèle de Données

### Types Principaux

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  role: 'fisherman' | 'organization' | 'admin';
  profile: UserProfile;
}

interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

interface Alert {
  id: string;
  userId: string;
  type: 'emergency' | 'zone_violation' | 'weather' | 'system';
  message: string;
  location?: Location;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

### Base de Données Supabase

#### Tables Principales
- `profiles` - Profils utilisateurs étendus
- `locations` - Positions GPS temps réel
- `alerts` - Système d'alertes
- `messages` - Messagerie instantanée
- `zones` - Zones géographiques
- `trips` - Historique des sorties
- `weather_data` - Données météorologiques

#### Sécurité RLS
Chaque table utilise Row Level Security pour contrôler l'accès :

```sql
-- Exemple : Les utilisateurs ne voient que leurs propres données
CREATE POLICY "Users can view own data" ON locations
  FOR SELECT USING (auth.uid() = user_id);

-- Les organisations voient toutes les données
CREATE POLICY "Organizations can view all" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('organization', 'admin')
    )
  );
```

## 🔄 Flux de Données

### 1. Authentification
```
LoginForm → AuthContext → Supabase Auth → Profile Loading → App Render
```

### 2. Données Temps Réel
```
User Action → DataContext → Supabase → WebSocket → UI Update
```

### 3. Géolocalisation
```
Browser Geolocation → Location Update → Database → Real-time Sync → Map Update
```

## 🎨 Système de Design

### Couleurs
```css
/* Palette maritime */
--cyan-600: #0891b2;
--blue-600: #2563eb;
--green-600: #059669;
--red-600: #dc2626;
--yellow-600: #d97706;
```

### Composants UI
- **Boutons** : Gradients avec hover effects
- **Cartes** : Ombres douces, coins arrondis
- **Animations** : Framer Motion pour les transitions
- **Responsive** : Mobile-first avec Tailwind

### Iconographie
Utilisation cohérente de Lucide React :
- `Ship` - Pirogues/Navigation
- `MapPin` - Géolocalisation
- `AlertTriangle` - Alertes/Urgences
- `Users` - Gestion utilisateurs
- `MessageCircle` - Communication

## 🔧 Configuration et Déploiement

### Variables d'Environnement
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Scripts NPM
```json
{
  "dev": "vite",                    // Développement
  "build": "vite build",            // Build production
  "preview": "vite preview",        // Prévisualisation
  "lint": "eslint ."               // Linting
}
```

### Déploiement
1. **Build** : `npm run build`
2. **Test** : `npm run preview`
3. **Deploy** : Upload du dossier `dist/`

## 🧪 Tests et Debugging

### Outils de Debug
- **React DevTools** - Inspection des composants
- **Supabase Dashboard** - Monitoring base de données
- **Browser DevTools** - Network, Console, Performance

### Tests Manuels
Voir `docs/TESTING_CHECKLIST.md` pour la liste complète des tests.

### Logs et Monitoring
```typescript
// Logs structurés
console.log('User action:', { userId, action, timestamp });

// Gestion d'erreurs
try {
  await supabaseOperation();
} catch (error) {
  console.error('Supabase error:', error);
  // Fallback vers données locales
}
```

## 🚀 Bonnes Pratiques

### Code Quality
- **TypeScript strict** - Typage complet
- **ESLint rules** - Cohérence du code
- **Component composition** - Réutilisabilité
- **Custom hooks** - Logique métier séparée

### Performance
- **Lazy loading** - Chargement à la demande
- **Memoization** - React.memo, useMemo
- **Optimistic updates** - UI réactive
- **Error boundaries** - Gestion d'erreurs

### Sécurité
- **RLS policies** - Contrôle d'accès base de données
- **Input validation** - Validation côté client et serveur
- **HTTPS only** - Communications sécurisées
- **Environment variables** - Secrets protégés

## 🔄 Workflow de Développement

### 1. Nouvelle Fonctionnalité
```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer
npm run dev

# 3. Tester
npm run lint
# Tests manuels selon checklist

# 4. Build
npm run build

# 5. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### 2. Debugging
```typescript
// Activer les logs détaillés
localStorage.setItem('debug', 'pirogue:*');

// Vérifier l'état des contextes
const { user, isLoading } = useAuth();
console.log('Auth state:', { user, isLoading });

// Tester les connexions
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log('DB test:', { data, error });
```

## 📚 Ressources Utiles

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Outils
- [VS Code Extensions](../.vscode/extensions.json)
- [Supabase Dashboard](https://app.supabase.com/)
- [Vercel/Netlify](https://vercel.com/) pour le déploiement

---

**Ce guide couvre les aspects essentiels du développement sur Pirogue Connect. Pour des questions spécifiques, consultez le code source ou la documentation des technologies utilisées.**