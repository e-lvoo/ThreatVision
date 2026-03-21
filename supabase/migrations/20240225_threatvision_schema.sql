-- ThreatVision Schema Migration
-- Date: 2026-02-25

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text not null check (role in ('Admin', 'Network Admin', 'Analyst', 'Viewer')) default 'Viewer',
    full_name text,
    avatar_url text,
    updated_at timestamptz default now()
);

-- 2. Model Info Table
create table if not exists public.model_info (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    version text not null,
    source text not null,
    threshold float not null default 0.8,
    last_updated timestamptz default now()
);

-- 3. Detection Results Table
create table if not exists public.detection_results (
    id uuid default uuid_generate_v4() primary key,
    timestamp timestamptz default now(),
    source_ip text,
    network_data text,
    input_hash text,
    classification text not null,
    confidence float not null,
    probabilities jsonb,
    model_version text,
    user_id uuid references auth.users,
    latency_ms float,
    device_id text
);

-- 4. Alerts Table
create table if not exists public.alerts (
    id uuid default uuid_generate_v4() primary key,
    detection_id uuid references public.detection_results on delete cascade,
    severity text check (severity in ('Low', 'Medium', 'High', 'Critical')),
    status text check (status in ('new', 'acknowledged', 'resolved')) default 'new',
    assigned_to uuid references auth.users,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 5. Configurations Table
create table if not exists public.configurations (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz default now()
);

-- 6. Monitoring Metrics Table
create table if not exists public.monitoring_metrics (
    id uuid default uuid_generate_v4() primary key,
    metric_name text not null,
    metric_value float not null,
    timestamp timestamptz default now()
);

-- 7. Audit Logs Table
create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid,
    action text not null,
    target text,
    metadata jsonb,
    timestamp timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.detection_results enable row level security;
alter table public.alerts enable row level security;
alter table public.model_info enable row level security;
alter table public.configurations enable row level security;
alter table public.monitoring_metrics enable row level security;
alter table public.audit_logs enable row level security;

-- Basic RLS Policies (Draft)
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

create policy "Analyst/Admin can view all detections" on public.detection_results for select
using (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Analyst')));

create policy "Analyst/Admin can view all alerts" on public.alerts for select
using (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Analyst')));

-- Realtime Configuration
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.detection_results;
