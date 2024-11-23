import { UpdateSearchVisit } from "./UpdateSearchVisit.js";
import soap from "soap";
import dotenv from "dotenv";
dotenv.config();

const { APP_NAME, APP_SECRET, APP_KEY } = process.env;

const url = "https://app2.hhaexchange.com/integration/ent/v1.8/ws.asmx?WSDL";

const UpdateGetVisitInfo = async (caregiverId, month) => {
  console.log(month);
  try {
    // Initialize extractData as an object, not an array
    const extractData = {};

    // Get an array of Visit IDs from the SearchVisits method
    const VisitIDArray = await UpdateSearchVisit(caregiverId, month);

    // Use map to create an array of promises
    const visitPromises = VisitIDArray.map(async (visit) => {
      const args = {
        Authentication: {
          AppName: APP_NAME,
          AppSecret: APP_SECRET,
          AppKey: APP_KEY,
        },
        VisitInfo: {
          ID: visit,
        },
      };

      // Create the SOAP client
      const client = await soap.createClientAsync(url);

      // Call the SOAP API
      const result = await client.GetVisitInfoV2Async(args);

      // Extract the necessary data and filter it
      const visitInfo = result[0]?.GetVisitInfoV2Result.VisitInfo;
      if (visitInfo) {
        filterData(
          visitInfo.PrebillingProblems,
          visitInfo.Patient,
          visitInfo.VisitStartTime,
          visitInfo.VisitEndTime,
          extractData
        );
      }
    });

    // Wait for all API calls to complete
    await Promise.all(visitPromises);

    // Convert the extractData object into an array format

    console.log(extractData);

    return extractData;
  } catch (error) {
    console.error("Error in GetVisitInfo:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

const filterData = (
  PrebillingProblems,
  Patient,
  VisitStartTime,
  VisitEndTime,
  extractData
) => {
  const shouldProcess =
    (PrebillingProblems==null)||
    (PrebillingProblems.PrebillingProblemInfo === null &&
      VisitStartTime !== "" &&
      VisitEndTime !== "") ||
    (PrebillingProblems.PrebillingProblemInfo.length === 1 &&
      PrebillingProblems.PrebillingProblemInfo[0].Problem ===
        "Caregiver Compliance");

  if (!shouldProcess) {
    return;
  }

  console.log("I am working");
  let hoursWorked = 0;
  let minutesWorked = 0;

  if (VisitStartTime && VisitEndTime) {
    const startTime = new Date(VisitStartTime);
    const endTime = new Date(VisitEndTime);
    console.log("Start time: " + startTime + ",end time: " + endTime);

    // Calculate the difference in milliseconds
    const timeDiff = endTime - startTime;

    // Convert to hours and minutes
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    // Convert to decimal format (hours.minutes)
    hoursWorked = hours + minutes / 60;
  }

  const visitDate = VisitStartTime
    ? new Date(VisitStartTime).toISOString().split("T")[0]
    : VisitEndTime
    ? new Date(VisitEndTime).toISOString().split("T")[0]
    : "Unknown Date";

  const ID = Patient.AdmissionNumber;

  // Initialize the array for this patient if it doesn't exist
  if (!extractData[ID]) {
    extractData[ID] = [];
  }

  // Add the new visit information if we have a valid date
  if (visitDate !== "Unknown Date") {
    extractData[ID].push({
      Date: visitDate,
      HoursWorked: Number(hoursWorked.toFixed(2)), // Round to 2 decimal places
    });

    // Sort visits by date
    extractData[ID].sort((a, b) => new Date(a.Date) - new Date(b.Date));
  }
};

export { UpdateGetVisitInfo };
