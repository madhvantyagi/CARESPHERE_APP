import express from "express";
import compression from "compression";
import { GetVisitInfo } from "./CalenedarAPI/GetVisitInfoV2.js";
import { UpdateGetVisitInfo } from "./sevenDays/GetVisitInfoV2.js";
import { searchContracts } from "./Patient/patient.js";
import { getTimesheetData } from "./TimeSheet/TimeSheet.js";
import cors from "cors";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

const app = express();

// Validate required environment variables
const requiredEnvVars = ["APP_NAME", "APP_SECRET", "APP_KEY"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Input validation middleware
const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date");
  }
  return true;
};

const validateCaregiverId = (id) => {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Invalid caregiver ID");
  }
  return true;
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

// Routes
app.get("/api/caregiver/:month/:caregiverId/", async (req, res, next) => {
  try {
    const { caregiverId, month } = req.params;
    validateCaregiverId(caregiverId);
    validateDate(month);

    const caregiverData = await GetVisitInfo(caregiverId, month);

    if (!caregiverData || caregiverData.length === 0) {
      return res.status(404).json({
        error: {
          message: "No data found for the given caregiver and month",
          caregiverId,
          month,
        },
      });
    }

    res.json(caregiverData);
  } catch (error) {
    next(error);
  }
});

app.get(
  "/api/caregiver/hoursworked/:month/:caregiverId",
  async (req, res, next) => {
    try {
      const { caregiverId, month } = req.params;
      validateCaregiverId(caregiverId);
      validateDate(month);

      const newData = await UpdateGetVisitInfo(caregiverId, month);

      if (!newData) {
        return res.status(404).json({
          error: {
            message: "No hours worked data found",
            caregiverId,
            month,
          },
        });
      }

      res.json(newData);
    } catch (error) {
      next(error);
    }
  }
);

app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/patient/:caregiver", async (req, res, next) => {
  try {
    const { caregiver } = req.params;
    validateCaregiverId(caregiver);

    const data = await searchContracts(caregiver);

    if (!data) {
      return res.status(404).json({
        error: {
          message: "No patient data found",
          caregiver,
        },
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/timesheet/:caregiverCode", async (req, res, next) => {
  try {
    const { caregiverCode } = req.params;
    validateCaregiverId(caregiverCode);

    const data = await getTimesheetData(caregiverCode);

    if (!data) {
      return res.status(404).json({
        error: {
          message: "No timesheet data found",
          caregiverCode,
        },
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`Development server running on port ${PORT}`);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
