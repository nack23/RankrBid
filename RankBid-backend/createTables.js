const pool = require("./db");
const categoryCatalog = require("./categoryCatalog");

async function createTables() {
  try {
    // =====================================================
    // 1. USERS
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,

        full_name VARCHAR(150) NOT NULL,

        email VARCHAR(255) NOT NULL UNIQUE,

        phone VARCHAR(30),

        country VARCHAR(100),

        zip_code VARCHAR(20),

        is_business BOOLEAN NOT NULL DEFAULT FALSE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ users table ready");


    // =====================================================
    // 2. CATEGORIES
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGSERIAL PRIMARY KEY,

        name VARCHAR(150) NOT NULL UNIQUE,

        slug VARCHAR(180) NOT NULL UNIQUE,

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ categories table ready");

    // Existing installations may have only the first category pages seeded.
    // Add missing categories without changing the IDs of existing listings.
    for (const { name, slug } of categoryCatalog) {
      await pool.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug`,
        [name, slug]
      );
    }
    console.log(`✅ ${categoryCatalog.length} categories available`);


    // =====================================================
    // 3. RANK CLAIMS
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rank_claims (
        id BIGSERIAL PRIMARY KEY,

        user_id BIGINT NOT NULL
          REFERENCES users(id)
          ON DELETE RESTRICT,

        category_id BIGINT NOT NULL
          REFERENCES categories(id)
          ON DELETE RESTRICT,

        target VARCHAR(500) NOT NULL,

        amount NUMERIC(12,2) NOT NULL,

        status VARCHAR(30) NOT NULL DEFAULT 'pending',

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        paid_at TIMESTAMPTZ
      );
    `);

    console.log("✅ rank_claims table ready");


    // =====================================================
    // 3A. RANK CLAIM EXTRA COLUMNS
    // =====================================================

    await pool.query(`
      ALTER TABLE rank_claims
      ADD COLUMN IF NOT EXISTS site_title VARCHAR(500);

      ALTER TABLE rank_claims
      ADD COLUMN IF NOT EXISTS description TEXT;

      ALTER TABLE rank_claims
      ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(1000);

      ALTER TABLE rank_claims
      ADD COLUMN IF NOT EXISTS clicks BIGINT NOT NULL DEFAULT 0;
    `);

    console.log(
      "✅ rank_claims metadata + click columns ready"
    );


    // =====================================================
    // 4. PAYMENTS
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGSERIAL PRIMARY KEY,

        claim_id BIGINT NOT NULL
          REFERENCES rank_claims(id)
          ON DELETE RESTRICT,

        amount NUMERIC(12,2) NOT NULL,

        payment_method VARCHAR(30) NOT NULL,

        payment_reference VARCHAR(100) UNIQUE NOT NULL,

        status VARCHAR(30) NOT NULL DEFAULT 'pending',

        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        paid_at TIMESTAMPTZ
      );
    `);

    console.log("✅ payments table ready");


    // =====================================================
    // 4A. RAZORPAY PAYMENT COLUMNS
    // =====================================================

    await pool.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100);

      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
    `);

    console.log(
      "✅ Razorpay payment columns ready"
    );


    // =====================================================
    // 4B. PAYMENT CURRENCY / CONVERSION COLUMNS
    // =====================================================

    await pool.query(`
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'INR';

      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(12,6);

      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS original_amount_usd NUMERIC(12,2);
    `);

    console.log(
      "✅ Payment currency + conversion columns ready"
    );


    // =====================================================
    // 4C. RAZORPAY PAYMENT INDEXES
    // =====================================================

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      idx_payments_razorpay_order_id
      ON payments(razorpay_order_id)
      WHERE razorpay_order_id IS NOT NULL;

      CREATE UNIQUE INDEX IF NOT EXISTS
      idx_payments_razorpay_payment_id
      ON payments(razorpay_payment_id)
      WHERE razorpay_payment_id IS NOT NULL;
    `);

    console.log(
      "✅ Razorpay payment indexes ready"
    );


    // =====================================================
    // 5. VISITORS
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id BIGSERIAL PRIMARY KEY,

        visitor_id VARCHAR(100) UNIQUE NOT NULL,

        first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),

        last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ visitors table ready");


    // =====================================================
    // 5A. VISITOR EXTRA COLUMNS
    // =====================================================

    await pool.query(`
      ALTER TABLE visitors
      ADD COLUMN IF NOT EXISTS total_visits
      BIGINT NOT NULL DEFAULT 1;

      ALTER TABLE visitors
      ADD COLUMN IF NOT EXISTS last_visit_counted_at
      TIMESTAMPTZ;
    `);

    console.log(
      "✅ visitor tracking columns ready"
    );


    // =====================================================
    // 6. VISIT HISTORY
    //
    // Every counted visit gets one row.
    //
    // Same visitor is counted again
    // only after 30 minutes.
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_visits (
        id BIGSERIAL PRIMARY KEY,

        visitor_id VARCHAR(100) NOT NULL
          REFERENCES visitors(visitor_id)
          ON DELETE CASCADE,

        visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log(
      "✅ visitor_visits table ready"
    );


    // =====================================================
    // 6A. VISITOR HISTORY INDEXES
    // =====================================================

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_visitor_visits_visitor_id

      ON visitor_visits(visitor_id);

      CREATE INDEX IF NOT EXISTS
      idx_visitor_visits_visited_at

      ON visitor_visits(visited_at);
    `);

    console.log(
      "✅ visitor indexes ready"
    );


    // =====================================================
    // 7. CLAIM CLICK HISTORY
    //
    // Every valid counted click gets one row.
    //
    // Same visitor + same claim:
    //   - within 15 minutes  = NOT counted
    //   - after 15 minutes   = counted again
    //
    // Different visitor:
    //   - counted immediately
    // =====================================================

    await pool.query(`
      CREATE TABLE IF NOT EXISTS claim_clicks (
        id BIGSERIAL PRIMARY KEY,

        claim_id BIGINT NOT NULL
          REFERENCES rank_claims(id)
          ON DELETE CASCADE,

        visitor_id VARCHAR(100) NOT NULL,

        clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log(
      "✅ claim_clicks table ready"
    );


    // =====================================================
    // 7A. CLAIM CLICK INDEXES
    // =====================================================

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_claim_clicks_claim_id

      ON claim_clicks(claim_id);

      CREATE INDEX IF NOT EXISTS
      idx_claim_clicks_visitor_id

      ON claim_clicks(visitor_id);

      CREATE INDEX IF NOT EXISTS
      idx_claim_clicks_claim_visitor

      ON claim_clicks(
        claim_id,
        visitor_id
      );

      CREATE INDEX IF NOT EXISTS
      idx_claim_clicks_clicked_at

      ON claim_clicks(clicked_at);
    `);

    console.log(
      "✅ claim click indexes ready"
    );


    // =====================================================
    // 8. CLAIM INDEXES
    // =====================================================

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_rank_claims_category_id

      ON rank_claims(category_id);

      CREATE INDEX IF NOT EXISTS
      idx_rank_claims_status

      ON rank_claims(status);

      CREATE INDEX IF NOT EXISTS
      idx_rank_claims_amount

      ON rank_claims(amount DESC);

      CREATE INDEX IF NOT EXISTS
      idx_rank_claims_created_at

      ON rank_claims(created_at DESC);

      CREATE INDEX IF NOT EXISTS
      idx_rank_claims_paid_at

      ON rank_claims(paid_at);
    `);

    console.log(
      "✅ claim indexes ready"
    );


    // =====================================================
    // 9. FINAL CHECKS
    // =====================================================

    const claimClickTable =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.tables

          WHERE
            table_schema = 'public'

            AND table_name =
              'claim_clicks'
        ) AS exists;
      `);


    const visitorVisitTable =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.tables

          WHERE
            table_schema = 'public'

            AND table_name =
              'visitor_visits'
        ) AS exists;
      `);


    const clicksColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'rank_claims'

            AND column_name =
              'clicks'
        ) AS exists;
      `);


    const razorpayOrderColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'razorpay_order_id'
        ) AS exists;
      `);


    const razorpayPaymentColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'razorpay_payment_id'
        ) AS exists;
      `);


    const razorpaySignatureColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'razorpay_signature'
        ) AS exists;
      `);


    const currencyColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'currency'
        ) AS exists;
      `);


    const exchangeRateColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'exchange_rate'
        ) AS exists;
      `);


    const originalAmountUsdColumn =
      await pool.query(`
        SELECT EXISTS (
          SELECT
            1

          FROM information_schema.columns

          WHERE
            table_schema = 'public'

            AND table_name =
              'payments'

            AND column_name =
              'original_amount_usd'
        ) AS exists;
      `);


    // =====================================================
    // DATABASE STRUCTURE CHECK
    // =====================================================

    console.log(
      "\n----------------------------------------"
    );

    console.log(
      "Database structure check:"
    );


    console.log(
      "claim_clicks table:",
      claimClickTable.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "visitor_visits table:",
      visitorVisitTable.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "rank_claims.clicks:",
      clicksColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.razorpay_order_id:",
      razorpayOrderColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.razorpay_payment_id:",
      razorpayPaymentColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.razorpay_signature:",
      razorpaySignatureColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.currency:",
      currencyColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.exchange_rate:",
      exchangeRateColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "payments.original_amount_usd:",
      originalAmountUsdColumn.rows[0].exists
        ? "✅"
        : "❌"
    );


    console.log(
      "----------------------------------------"
    );


    // =====================================================
    // DONE
    // =====================================================

    console.log(
      "\n🎉 All tables and updates completed successfully!"
    );

  } catch (error) {
    console.error(
      "\n❌ Error creating/updating tables:",
      error
    );

  } finally {
    await pool.end();
  }
}


createTables();
