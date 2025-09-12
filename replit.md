# Overview

BLUE-TRACK is a comprehensive maritime management system designed for fishermen in Senegal. The platform combines traditional fishing practices with modern technology, providing real-time tracking, emergency alerts, weather monitoring, and communication tools. The system serves fishermen, organizations (GIE), and administrators with role-based interfaces and features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for type safety and modern development patterns
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling with custom maritime and African-inspired color themes
- **Framer Motion** for smooth animations and micro-interactions
- **React Context API** for state management (AuthContext, DataContext)
- **Component-based architecture** with reusable UI components

## Backend Options
The system supports two backend architectures:

### Option 1: Django REST Framework (Recommended)
- **Django 5.0** with Django REST Framework for API development
- **PostgreSQL with PostGIS** for geospatial data handling
- **Django Channels** for real-time WebSocket communication
- **Token-based authentication** with role-based permissions
- **Celery with Redis** for background task processing

### Option 2: Supabase Backend-as-a-Service
- **PostgreSQL with PostGIS** managed by Supabase
- **Row Level Security (RLS)** for data access control
- **Real-time subscriptions** for live updates
- **Built-in authentication** and user management
- **File storage** for avatars and chat attachments

## Data Architecture
- **User management** with role-based access (fisherman, organization, admin)
- **Real-time location tracking** with geographic data types
- **Zone management** for safety, fishing, and restricted areas
- **Alert system** with severity levels and status tracking
- **Trip history** with detailed metrics and analytics
- **Communication system** with channels and direct messaging

## Authentication & Authorization
- **Multi-role system** with distinct interfaces and permissions
- **JWT or Token-based authentication** with persistent sessions
- **Role-based access control** for features and data visibility
- **Profile management** with user-specific settings

## Real-time Features
- **Live location tracking** using browser geolocation API
- **WebSocket connections** for instant messaging and alerts
- **Real-time map updates** with boat positions and zones
- **Emergency button** with countdown and automatic alert sending

## Mapping & Geolocation
- **React Leaflet** integration with OpenStreetMap tiles
- **Custom boat icons** and zone visualization
- **PostGIS spatial queries** for zone violations and proximity
- **Geographic coordinate handling** with proper projections

# External Dependencies

## Core Technologies
- **Node.js 18+** - Runtime environment
- **PostgreSQL with PostGIS** - Primary database with spatial extensions
- **Redis** - Caching and real-time features (Django option)

## APIs & Services
- **OpenStreetMap** - Map tiles and geographic data
- **WeatherAPI** - Weather conditions and marine forecasts
- **Supabase** - Alternative backend-as-a-service option
- **Browser Geolocation API** - User location tracking

## Development Tools
- **ESLint & TypeScript** - Code quality and type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet.js** - Interactive mapping library

## Optional Integrations
- **SMS services** - Emergency notifications
- **Email services** - User communications
- **GPS tracker webhooks** - Hardware device integration
- **File storage services** - Avatar and chat file uploads

The system is designed to work in multiple deployment scenarios, from simple development setups to production environments with external hardware integrations.