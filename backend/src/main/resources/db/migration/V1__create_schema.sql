CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    owner_id    BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    description VARCHAR(140)   NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type        VARCHAR(10)    NOT NULL,
    category    VARCHAR(20)    NOT NULL,
    date        DATE           NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL
);

-- Todas as consultas filtram por dono e período
CREATE INDEX idx_transactions_owner_date ON transactions (owner_id, date);
