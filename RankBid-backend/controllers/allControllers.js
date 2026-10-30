const pool = require("../db");

const {
  fetchWebsiteMetadata,
} = require("../services/websiteMetadata");

// ========================================
// REGISTER / UPDATE VISITOR
// ========================================

async function registerVisitor(req, res) {
  const client = await pool.connect();

  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "visitorId is required",
      });
    }

    await client.query("BEGIN");

    // ----------------------------------------
    // CREATE VISITOR IF NEW
    // ----------------------------------------

    await client.query(
      `
      INSERT INTO visitors (
        visitor_id,
        first_seen,
        last_seen,
        total_visits,
        last_visit_counted_at
      )
      VALUES (
        $1,
        NOW(),
        NOW(),
        0,
        NULL
      )
      ON CONFLICT (visitor_id)
      DO UPDATE SET
        last_seen = NOW()
      `,
      [visitorId]
    );

    // ----------------------------------------
    // CHECK 30-MINUTE VISIT WINDOW
    // ----------------------------------------

    const visitCheck = await client.query(
      `
      SELECT
        last_visit_counted_at,

        (
          last_visit_counted_at IS NULL

          OR

          last_visit_counted_at <=
            NOW() - INTERVAL '30 minutes'

        ) AS should_count

      FROM visitors

      WHERE visitor_id = $1

      FOR UPDATE
      `,
      [visitorId]
    );

    const shouldCount =
      visitCheck.rows[0]?.should_count === true;

    let countedVisit = false;

    // ----------------------------------------
    // COUNT VISIT
    // ----------------------------------------

    if (shouldCount) {
      await client.query(
        `
        INSERT INTO visitor_visits (
          visitor_id,
          visited_at
        )
        VALUES (
          $1,
          NOW()
        )
        `,
        [visitorId]
      );

      await client.query(
        `
        UPDATE visitors

        SET
          total_visits =
            total_visits + 1,

          last_visit_counted_at =
            NOW(),

          last_seen =
            NOW()

        WHERE visitor_id = $1
        `,
        [visitorId]
      );

      countedVisit = true;
    }

    // ----------------------------------------
    // GET UPDATED VISITOR
    // ----------------------------------------

    const result = await client.query(
      `
      SELECT
        id,
        visitor_id,
        first_seen,
        last_seen,
        total_visits,
        last_visit_counted_at

      FROM visitors

      WHERE visitor_id = $1
      `,
      [visitorId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,

      countedVisit,

      visitor:
        result.rows[0],
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "Visitor registration error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Visitor could not be recorded",
    });

  } finally {
    client.release();
  }
}


// ========================================
// UPDATE VISITOR HEARTBEAT
// ========================================

async function visitorHeartbeat(req, res) {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "visitorId is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE visitors

      SET
        last_seen = NOW()

      WHERE visitor_id = $1

      RETURNING
        id,
        visitor_id,
        last_seen
      `,
      [visitorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Visitor not found",
      });
    }

    res.json({
      success: true,

      visitor:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "Heartbeat error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Heartbeat failed",
    });
  }
}


// ========================================
// VISITOR STATISTICS
// ========================================

async function getVisitorStats(req, res) {
  try {
    // ----------------------------------------
    // ALL-TIME COUNTED VISITS
    // ----------------------------------------

    const totalResult = await pool.query(`
      SELECT
        COUNT(*) AS total

      FROM visitor_visits
    `);

    // ----------------------------------------
    // TODAY'S COUNTED VISITS
    // INDIA TIMEZONE
    // ----------------------------------------

    const todayResult = await pool.query(`
      SELECT
        COUNT(*) AS today

      FROM visitor_visits

      WHERE
        (
          visited_at
          AT TIME ZONE 'Asia/Kolkata'
        )::date =

        (
          NOW()
          AT TIME ZONE 'Asia/Kolkata'
        )::date
    `);

    // ----------------------------------------
    // CURRENTLY ONLINE
    // ----------------------------------------

    const onlineResult = await pool.query(`
      SELECT
        COUNT(*) AS online

      FROM visitors

      WHERE
        last_seen >=
        NOW() - INTERVAL '1 minute'
    `);

    res.json({
      success: true,

      total: Number(
        totalResult.rows[0].total
      ),

      today: Number(
        todayResult.rows[0].today
      ),

      online: Number(
        onlineResult.rows[0].online
      ),
    });

  } catch (error) {
    console.error(
      "Stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch visitor statistics",
    });
  }
}


// ========================================
// CREATE / UPDATE USER
// ========================================

async function createUser(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      country,
      zipCode,
      isBusiness,
    } = req.body || {};

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message:
          "Full name and email are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users (
        full_name,
        email,
        phone,
        country,
        zip_code,
        is_business
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )

      ON CONFLICT (email)

      DO UPDATE SET
        full_name =
          EXCLUDED.full_name,

        phone =
          EXCLUDED.phone,

        country =
          EXCLUDED.country,

        zip_code =
          EXCLUDED.zip_code,

        is_business =
          EXCLUDED.is_business

      RETURNING *
      `,
      [
        fullName.trim(),

        email
          .trim()
          .toLowerCase(),

        phone?.trim() ||
          null,

        country?.trim() ||
          null,

        zipCode?.trim() ||
          null,

        Boolean(isBusiness),
      ]
    );

    res.json({
      success: true,

      user:
        result.rows[0],
    });

  } catch (error) {
    console.error(
      "User error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not save user",
    });
  }
}


// ========================================
// GET ALL CATEGORIES
// ========================================

async function getCategories(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        slug,
        created_at

      FROM categories

      ORDER BY id ASC
    `);

    res.json({
      success: true,

      categories:
        result.rows,
    });

  } catch (error) {
    console.error(
      "Categories error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch categories",
    });
  }
}


// ========================================
// CREATE CLAIM + USER
//
// IMPORTANT:
// This endpoint ONLY creates a pending claim.
// It does NOT create a payment.
// It does NOT mark the claim as paid.
//
// Razorpay payment is handled separately by:
//   /api/payments/create-order
//   /api/payments/verify
// ========================================

async function createClaim(req, res) {
  const client = await pool.connect();

  let transactionStarted = false;

  try {
    const {
      target,
      categorySlug,
      amount,
      user,
    } = req.body || {};

    // ========================================
    // VALIDATION
    // ========================================

    if (!target || !categorySlug) {
      return res.status(400).json({
        success: false,
        message:
          "Target and category are required",
      });
    }

    if (!user || !user.fullName || !user.email) {
      return res.status(400).json({
        success: false,
        message:
          "User details are required",
      });
    }

    const claimAmount =
      Number(amount);

    if (
      !Number.isFinite(
        claimAmount
      ) ||
      claimAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid claim amount is required",
      });
    }

    // ========================================
    // FETCH WEBSITE METADATA
    // ========================================

    const metadata =
      await fetchWebsiteMetadata(
        target.trim()
      );

    // ========================================
    // START TRANSACTION
    // ========================================

    await client.query("BEGIN");

    transactionStarted = true;

    // ========================================
    // FIND CATEGORY
    // ========================================

    const categoryResult =
      await client.query(
        `
        SELECT
          id,
          name,
          slug

        FROM categories

        WHERE slug = $1
        `,
        [categorySlug]
      );

    if (
      categoryResult.rows.length === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      transactionStarted = false;

      return res.status(404).json({
        success: false,
        message:
          "Category not found",
      });
    }

    const category =
      categoryResult.rows[0];

    // ========================================
    // CREATE / UPDATE USER
    // ========================================

    const userResult =
      await client.query(
        `
        INSERT INTO users (
          full_name,
          email,
          phone,
          country,
          zip_code,
          is_business
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )

        ON CONFLICT (email)

        DO UPDATE SET
          full_name =
            EXCLUDED.full_name,

          phone =
            EXCLUDED.phone,

          country =
            EXCLUDED.country,

          zip_code =
            EXCLUDED.zip_code,

          is_business =
            EXCLUDED.is_business

        RETURNING
          id,
          full_name,
          email
        `,
        [
          user.fullName.trim(),

          user.email
            .trim()
            .toLowerCase(),

          user.phone?.trim() ||
            null,

          user.country?.trim() ||
            null,

          user.zipCode?.trim() ||
            null,

          Boolean(
            user.isBusiness
          ),
        ]
      );

    const savedUser =
      userResult.rows[0];

    // ========================================
    // CREATE PENDING CLAIM
    //
    // IMPORTANT:
    // - status MUST be pending
    // - paid_at MUST be NULL
    // - NO payment is created here
    // - NO paid update is performed here
    // ========================================

    const claimResult =
      await client.query(
        `
        INSERT INTO rank_claims (
          user_id,
          category_id,
          target,
          amount,
          status,
          paid_at,
          site_title,
          description,
          favicon_url,
          clicks
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          'pending',
          NULL,
          $5,
          $6,
          $7,
          0
        )

        RETURNING
          id,
          user_id,
          category_id,
          target,
          amount,
          status,
          created_at,
          paid_at,
          site_title,
          description,
          favicon_url,
          clicks
        `,
        [
          savedUser.id,

          category.id,

          target.trim(),

          claimAmount,

          metadata.siteTitle,

          metadata.description,
          metadata.faviconUrl,
        ]
      );

    const claim =
      claimResult.rows[0];

    // ========================================
    // SAFETY CHECK
    //
    // If somehow the database returns a paid
    // claim here, stop immediately.
    // ========================================

    if (
      claim.status !== "pending" ||
      claim.paid_at !== null
    ) {
      throw new Error(
        `New claim was not created as pending. Status=${claim.status}, paid_at=${claim.paid_at}`
      );
    }

    // ========================================
    // DEBUG LOG
    // ========================================

    console.log(
      "\n========== CLAIM CREATED =========="
    );

    console.log(
      "Claim ID:",
      claim.id
    );

    console.log(
      "Claim Amount:",
      claim.amount
    );

    console.log(
      "Claim Status:",
      claim.status
    );

    console.log(
      "Claim Paid At:",
      claim.paid_at
    );

    console.log(
      "Target:",
      claim.target
    );

    console.log(
      "===================================\n"
    );

    // ========================================
    // COMMIT
    // ========================================

    await client.query(
      "COMMIT"
    );

    transactionStarted = false;

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Claim created successfully",

      user:
        savedUser,

      claim:
        claim,
    });

  } catch (error) {

    if (transactionStarted) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch (rollbackError) {
        console.error(
          "Claim rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Claim error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not create claim",
    });

  } finally {
    client.release();
  }
}


// ========================================
// REGISTER CLAIM CLICK
//
// SAME VISITOR + SAME CLAIM
// = COUNT AGAIN ONLY AFTER 15 MINUTES
//
// DIFFERENT VISITOR
// = COUNT IMMEDIATELY
// ========================================

async function registerClaimClick(
  req,
  res
) {
  const client =
    await pool.connect();

  try {
    const { id } =
      req.params;

    const { visitorId } =
      req.body || {};

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message:
          "visitorId is required",
      });
    }

    const claimId =
      Number(id);

    if (
      !Number.isInteger(
        claimId
      ) ||
      claimId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid claim id",
      });
    }

    await client.query(
      "BEGIN"
    );

    // ----------------------------------------
    // LOCK CLAIM
    // ----------------------------------------

    const claimResult =
      await client.query(
        `
        SELECT
          id,
          clicks,
          status

        FROM rank_claims

        WHERE id = $1

        FOR UPDATE
        `,
        [claimId]
      );

    if (
      claimResult.rows.length === 0
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({
        success: false,
        message:
          "Claim not found",
      });
    }

    const claim =
      claimResult.rows[0];

    if (
      claim.status !== "paid"
    ) {
      await client.query(
        "ROLLBACK"
      );

      return res.status(400).json({
        success: false,
        message:
          "Only paid claims can receive clicks",
      });
    }

    // ----------------------------------------
    // FIND LAST CLICK
    // FOR SAME VISITOR + SAME CLAIM
    // ----------------------------------------

    const lastClickResult =
      await client.query(
        `
        SELECT
          clicked_at

        FROM claim_clicks

        WHERE
          claim_id = $1

          AND visitor_id = $2

        ORDER BY
          clicked_at DESC

        LIMIT 1
        `,
        [
          claimId,
          visitorId,
        ]
      );

    let shouldCount = true;

    // ----------------------------------------
    // 15 MINUTE WINDOW
    // ----------------------------------------

    if (
      lastClickResult.rows
        .length > 0
    ) {
      const lastClickTime =
        new Date(
          lastClickResult
            .rows[0]
            .clicked_at
        ).getTime();

      const fifteenMinutes =
        15 * 60 * 1000;

      if (
        Date.now() -
          lastClickTime <
        fifteenMinutes
      ) {
        shouldCount = false;
      }
    }

    let totalClicks =
      Number(
        claim.clicks || 0
      );

    // ----------------------------------------
    // COUNT CLICK
    // ----------------------------------------

    if (shouldCount) {

      // Store click history
      await client.query(
        `
        INSERT INTO claim_clicks (
          claim_id,
          visitor_id,
          clicked_at
        )

        VALUES (
          $1,
          $2,
          NOW()
        )
        `,
        [
          claimId,
          visitorId,
        ]
      );

      // Increase total click count
      const updatedResult =
        await client.query(
          `
          UPDATE rank_claims

          SET
            clicks =
              clicks + 1

          WHERE id = $1

          RETURNING clicks
          `,
          [claimId]
        );

      totalClicks =
        Number(
          updatedResult
            .rows[0]
            .clicks
        );
    }

    await client.query(
      "COMMIT"
    );

    res.json({
      success: true,

      counted:
        shouldCount,

      clicks:
        totalClicks,
    });

  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    console.error(
      "Claim click error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not register click",
    });

  } finally {
    client.release();
  }
}


// ========================================
// GET SINGLE CLAIM DETAILS
// ========================================

async function getClaimDetails(
  req,
  res
) {
  try {
    const claimId =
      Number(req.params.id);

    if (
      !Number.isInteger(
        claimId
      ) ||
      claimId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid claim id",
      });
    }

    // ========================================
    // GET CLAIM
    // ========================================

    const claimResult =
      await pool.query(
        `
        SELECT
          rc.id,
          rc.target,
          rc.amount,

          rc.site_title,
          rc.description,
          rc.favicon_url,
          rc.clicks,

          rc.status,
          rc.created_at,
          rc.paid_at,

          c.name AS category,
          c.slug AS category_slug

        FROM rank_claims rc

        JOIN categories c
          ON c.id = rc.category_id

        WHERE
          rc.id = $1

          AND rc.status = 'paid'
        `,
        [claimId]
      );

    if (
      claimResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Claim not found",
      });
    }

    const claim =
      claimResult.rows[0];

    // ========================================
    // OVERALL RANK
    // ========================================

    const overallRankResult =
      await pool.query(
        `
        SELECT rank
        FROM (
          SELECT
            id,

            ROW_NUMBER() OVER (
              ORDER BY
                amount DESC,
                created_at ASC
            ) AS rank

          FROM rank_claims

          WHERE
            status = 'paid'
        ) ranked

        WHERE id = $1
        `,
        [claimId]
      );

    // ========================================
    // CATEGORY RANK
    // ========================================

    const categoryRankResult =
      await pool.query(
        `
        SELECT rank
        FROM (
          SELECT
            rc.id,

            ROW_NUMBER() OVER (
              ORDER BY
                rc.amount DESC,
                rc.created_at ASC
            ) AS rank

          FROM rank_claims rc

          WHERE
            rc.status = 'paid'

            AND rc.category_id = (
              SELECT category_id
              FROM rank_claims
              WHERE id = $1
            )
        ) ranked

        WHERE id = $1
        `,
        [claimId]
      );

    // ========================================
    // TODAY OVERALL RANK
    // ========================================

    const todayOverallRankResult =
      await pool.query(
        `
        SELECT rank
        FROM (
          SELECT
            id,

            ROW_NUMBER() OVER (
              ORDER BY
                amount DESC,
                paid_at ASC
            ) AS rank

          FROM rank_claims

          WHERE
            status = 'paid'

            AND (
              paid_at
              AT TIME ZONE 'UTC'
            )::date =

            (
              NOW()
              AT TIME ZONE 'UTC'
            )::date
        ) ranked

        WHERE id = $1
        `,
        [claimId]
      );

    // ========================================
    // TODAY CATEGORY RANK
    // ========================================

    const todayCategoryRankResult =
      await pool.query(
        `
        SELECT rank
        FROM (
          SELECT
            rc.id,

            ROW_NUMBER() OVER (
              ORDER BY
                rc.amount DESC,
                rc.paid_at ASC
            ) AS rank

          FROM rank_claims rc

          WHERE
            rc.status = 'paid'

            AND rc.category_id = (
              SELECT category_id
              FROM rank_claims
              WHERE id = $1
            )

            AND (
              rc.paid_at
              AT TIME ZONE 'UTC'
            )::date =

            (
              NOW()
              AT TIME ZONE 'UTC'
            )::date
        ) ranked

        WHERE id = $1
        `,
        [claimId]
      );

    // ========================================
    // TOTAL CATEGORY CLAIMS
    // ========================================

    const categoryTotalResult =
      await pool.query(
        `
        SELECT
          COUNT(*) AS total

        FROM rank_claims

        WHERE
          status = 'paid'

          AND category_id = (
            SELECT category_id
            FROM rank_claims
            WHERE id = $1
          )
        `,
        [claimId]
      );

    // ========================================
    // TOTAL OVERALL CLAIMS
    // ========================================

    const overallTotalResult =
      await pool.query(`
        SELECT
          COUNT(*) AS total

        FROM rank_claims

        WHERE
          status = 'paid'
      `);

    // ========================================
    // TODAY CATEGORY TOTAL
    // ========================================

    const todayCategoryTotalResult =
      await pool.query(
        `
        SELECT
          COUNT(*) AS total

        FROM rank_claims

        WHERE
          status = 'paid'

          AND category_id = (
            SELECT category_id
            FROM rank_claims
            WHERE id = $1
          )

          AND (
            paid_at
            AT TIME ZONE 'UTC'
          )::date =

          (
            NOW()
            AT TIME ZONE 'UTC'
          )::date
        `,
        [claimId]
      );

    // ========================================
    // TODAY OVERALL TOTAL
    // ========================================

    const todayOverallTotalResult =
      await pool.query(`
        SELECT
          COUNT(*) AS total

        FROM rank_claims

        WHERE
          status = 'paid'

          AND (
            paid_at
            AT TIME ZONE 'UTC'
          )::date =

          (
            NOW()
            AT TIME ZONE 'UTC'
          )::date
      `);

    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      success: true,

      claim: {
        ...claim,

        clicks: Number(
          claim.clicks || 0
        ),
      },

      ranks: {
        category: overallNumber(
          categoryRankResult
            .rows[0]?.rank
        ),

        overall: overallNumber(
          overallRankResult
            .rows[0]?.rank
        ),

        todayCategory:
          overallNumber(
            todayCategoryRankResult
              .rows[0]?.rank
          ),

        todayOverall:
          overallNumber(
            todayOverallRankResult
              .rows[0]?.rank
          ),
      },

      totals: {
        category: Number(
          categoryTotalResult
            .rows[0].total
        ),

        overall: Number(
          overallTotalResult
            .rows[0].total
        ),

        todayCategory:
          Number(
            todayCategoryTotalResult
              .rows[0].total
          ),

        todayOverall:
          Number(
            todayOverallTotalResult
              .rows[0].total
          ),
      },
    });

  } catch (error) {
    console.error(
      "Claim details error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch claim details",
    });
  }
}


// ========================================
// HELPER
// ========================================

function overallNumber(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return Number(value);
}


// ========================================
// GET ALL PAID CLAIMS
// ========================================

async function getAllClaims(
  req,
  res
) {
  try {
    const result =
      await pool.query(`
        SELECT
          rc.id,
          rc.target,
          rc.amount,

          rc.site_title,
          rc.description,
          rc.favicon_url,
          rc.clicks,

          rc.status,
          rc.created_at,
          rc.paid_at,

          c.name AS category,
          c.slug AS category_slug

        FROM rank_claims rc

        JOIN categories c
          ON c.id = rc.category_id

        WHERE
          rc.status = 'paid'

        ORDER BY
          rc.amount DESC,
          rc.created_at ASC
      `);

    res.json({
      success: true,

      claims:
        result.rows.map(
          (claim) => ({
            ...claim,

            clicks: Number(
              claim.clicks || 0
            ),
          })
        ),
    });

  } catch (error) {
    console.error(
      "Claims fetch error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch claims",
    });
  }
}


// ========================================
// GET CLAIMS BY CATEGORY
// ========================================

async function getCategoryClaims(
  req,
  res
) {
  try {
    const { slug } =
      req.params;

    const result =
      await pool.query(
        `
        SELECT
          rc.id,
          rc.target,
          rc.amount,

          rc.site_title,
          rc.description,
          rc.favicon_url,
          rc.clicks,

          rc.status,
          rc.created_at,
          rc.paid_at,

          c.name AS category,
          c.slug AS category_slug

        FROM rank_claims rc

        JOIN categories c
          ON c.id = rc.category_id

        WHERE
          c.slug = $1

          AND rc.status = 'paid'

        ORDER BY
          rc.amount DESC,
          rc.created_at ASC
        `,
        [slug]
      );

    res.json({
      success: true,

      claims:
        result.rows.map(
          (claim) => ({
            ...claim,

            clicks: Number(
              claim.clicks || 0
            ),
          })
        ),
    });

  } catch (error) {
    console.error(
      "Category claims error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch category claims",
    });
  }
}


// ========================================
// CLAIM STATISTICS
// ========================================

async function getClaimStats(
  req,
  res
) {
  try {
    const result =
      await pool.query(`
        SELECT

          COUNT(*) FILTER (
            WHERE
              status = 'paid'
          ) AS all_time,

          COUNT(*) FILTER (
            WHERE
              status = 'paid'

              AND (
                COALESCE(paid_at, created_at)
                AT TIME ZONE 'UTC'
              )::date =

              (
                NOW()
                AT TIME ZONE 'UTC'
              )::date
          ) AS today,

          COALESCE(
            SUM(amount) FILTER (
              WHERE
                status = 'paid'
            ),
            0
          ) AS total_amount,

          COALESCE(
            SUM(clicks) FILTER (
              WHERE
                status = 'paid'
            ),
            0
          ) AS total_clicks

        FROM rank_claims
      `);

    res.json({
      success: true,

      allTime: Number(
        result.rows[0].all_time
      ),

      today: Number(
        result.rows[0].today
      ),

      totalAmount: Number(
        result.rows[0].total_amount
      ),

      totalClicks: Number(
        result.rows[0].total_clicks
      ),
    });

  } catch (error) {
    console.error(
      "Claim stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not fetch claim statistics",
    });
  }
}


// ========================================
// EXPORT ALL CONTROLLERS
// ========================================

module.exports = {
  registerVisitor,
  visitorHeartbeat,
  getVisitorStats,

  createUser,

  getCategories,

  createClaim,

  registerClaimClick,

  getClaimDetails,

  getAllClaims,
  getCategoryClaims,
  getClaimStats,
};
