CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'opay',
  account_number TEXT NOT NULL,
  account_name TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('credit', 'debit');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type transaction_type NOT NULL,
  recipient TEXT NOT NULL,
  recipient_account TEXT,
  status transaction_status NOT NULL DEFAULT 'PENDING',
  provider TEXT DEFAULT 'opay',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS telegram_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  telegram_chat_id TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE telegram_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets"
  ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets"
  ON wallets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own telegram link"
  ON telegram_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own telegram link"
  ON telegram_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own telegram link"
  ON telegram_links FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
