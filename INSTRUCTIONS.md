# INSTRUCTIONS - Retro Wiki Setup

Since this is a backend-less app (Serverless), you need to set up your own Supabase project.

## 1. Supabase Setup
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to **Settings > API** and copy your `URL` and `anon` (public) key.
3. Paste these into `config.js` in your project folder.

## 2. Database Setup (SQL)
Go to the **SQL Editor** in Supabase and run this script to create the table and enable safety policies:

```sql
-- 1. Create Table
create table wiki_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  category text not null,
  tags text[] default '{}',
  bucket_path text not null,
  views int default 0,
  user_id uuid references auth.users(id) -- Optional: track who posted
);

-- 2. Enable Row Level Security
alter table wiki_articles enable row level security;

-- 3. Create Policy: Everyone can View
create policy "Public Articles are viewable by everyone"
  on wiki_articles for select
  using ( true );

-- 4. Create Policy: Only Authenticated Users (Admins) can Insert/Update/Delete
create policy "Admins can insert articles"
  on wiki_articles for insert
  with check ( auth.role() = 'authenticated' );

create policy "Admins can update articles"
  on wiki_articles for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete articles"
  on wiki_articles for delete
  using ( auth.role() = 'authenticated' );
```

## 3. Storage Setup
1. Go to **Storage** on the left sidebar.
2. Create a new Bucket named `wiki-content`.
3. Toggle "Public Bucket" to **OFF** (or ON if you prefer public URLs, but our code handles authenticated downloads if needed. Actually, for a public wiki, **ON** is easier).
   - **Recommendation**: Set Public to **ON**.
4. Policy Setup:
   - If Public is ON, you're good for reading.
   - For writing (Uploading), you need a policy.
   - Go to **Policies** under Storage.
   - For `wiki-content`:
     - Add Policy -> "Authenticated users can upload" -> SELECT, INSERT, UPDATE, DELETE -> Check `auth.role() = 'authenticated'`.
     - Add Policy -> "Public can view" -> SELECT -> `true` (if not already public).

## 4. Run the App
Simply open `index.html` in your browser.
- **Login**: Use the Admin Login link. You need to create a user in Supabase Auth > Users first (or enable Sign Up).

## 5. Deployment
Drag and drop this folder into **Netlify Drop** or push to **GitHub Pages**. It is 100% static.
