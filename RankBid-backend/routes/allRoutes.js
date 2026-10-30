const express = require("express");

const {
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
} = require("../controllers/allControllers");

const router = express.Router();

// ========================================
// VISITOR ROUTES
// ========================================

router.post(
  "/api/visitors",
  registerVisitor
);

router.post(
  "/api/visitors/heartbeat",
  visitorHeartbeat
);

router.get(
  "/api/visitors/stats",
  getVisitorStats
);

// ========================================
// USER ROUTES
// ========================================

router.post(
  "/api/users",
  createUser
);

// ========================================
// CATEGORY ROUTES
// ========================================

router.get(
  "/api/categories",
  getCategories
);

// ========================================
// CLAIM ROUTES
// ========================================

// Create claim
router.post(
  "/api/claims",
  createClaim
);

// Register claim click
router.post(
  "/api/claims/:id/click",
  registerClaimClick
);

// IMPORTANT:
// Specific GET routes must come BEFORE /api/claims/:id

// Claims by category
router.get(
  "/api/claims/category/:slug",
  getCategoryClaims
);

// Claim statistics
router.get(
  "/api/claims/stats",
  getClaimStats
);

// Single claim details
router.get(
  "/api/claims/:id",
  getClaimDetails
);

// All paid claims
router.get(
  "/api/claims",
  getAllClaims
);

module.exports = router;