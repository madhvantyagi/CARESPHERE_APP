import smartsheet from "smartsheet";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.MAIN_API;
console.log(API_KEY);

const client = smartsheet.createClient({
  accessToken: API_KEY,
});

const reportId = 2054883964309380;
const auth = {
  id: reportId,
  queryParameters: {
    pageSize: 10000,
  },
};

const getTimesheetData = async (CaregiverCode) => {
  try {
    const report = await client.reports.getReport(auth);
    const timesheetData = {};
    let tempcaregiverCode;
    let currentAdmissionId = "";
    let currentDateOfService = "";
    let currentStartTime = "";
    let currentEndTime = "";
    let currentTimesheetLink = "";

    report.rows.forEach((row) => {
      // Reset values for each row
      currentAdmissionId = "";
      currentDateOfService = "";
      currentStartTime = "";
      currentEndTime = "";
      currentTimesheetLink = "";

      // Extract data from cells using their columnIds
      row.cells.forEach((cell) => {
        switch (cell.columnId) {
          case 106013792620420: // Caregiver Code
            if (CaregiverCode == cell.displayValue) {
              tempcaregiverCode = cell.displayValue;
            }
            break;
          case 8902106814828420: // Admission ID (replaced Patient Name)
            currentAdmissionId = cell.displayValue || "N/A";
            break;
          case 1659194800295812: // Date of Service
            currentDateOfService = cell.value || "N/A";
            break;
          case 8472619178479492: // Start Time
            currentStartTime = cell.displayValue || "N/A";
            break;
          case 309844853870468: // End Time
            currentEndTime = cell.displayValue || "N/A";
            break;
          case 3348044660559748: // Timesheet Link
            currentTimesheetLink = cell.displayValue || "N/A";
            break;
        }
      });

      // Only process if we have a matching caregiver code
      if (tempcaregiverCode) {
        // Initialize caregiver object if it doesn't exist
        if (!timesheetData[tempcaregiverCode]) {
          timesheetData[tempcaregiverCode] = {};
        }

        // Initialize admission array if it doesn't exist
        if (!timesheetData[tempcaregiverCode][currentAdmissionId]) {
          timesheetData[tempcaregiverCode][currentAdmissionId] = [];
        }

        // Add the visit data to the admission's array
        timesheetData[tempcaregiverCode][currentAdmissionId].push({
          dateOfService: currentDateOfService,
          startTime: currentStartTime,
          endTime: currentEndTime,
          timesheetLink: currentTimesheetLink,
        });
      }
    });

    // Print the results
    console.log("Timesheet Data by Caregiver Code and Admission ID:");
    console.log(JSON.stringify(timesheetData, null, 2));
    return timesheetData;
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

export { getTimesheetData };
