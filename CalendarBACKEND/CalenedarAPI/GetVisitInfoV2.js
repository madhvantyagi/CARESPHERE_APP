import { SearchVisits } from "./SearchVisit.js";
import soap from "soap";
import dotenv from "dotenv";
dotenv.config();

const { APP_NAME, APP_SECRET, APP_KEY } = process.env;

const url = "https://app2.hhaexchange.com/integration/ent/v1.8/ws.asmx?WSDL";

const GetVisitInfo = async (caregiverId, month) => {
  console.log("GetVisitInfo" + month);
  const extractData = new Array(31).fill(null).map(() => []);
  try {
    // Get an array of Visit IDs from the SearchVisits method
    const VisitIDArray = await SearchVisits(caregiverId, month);
    // console.log(VisitIDArray);
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
      // console.log(visitInfo);
      filterData(
        visitInfo.PrebillingProblems,
        visitInfo.ScheduleStartTime,
        visitInfo.ScheduleEndTime,
        visitInfo.Patient,
        visitInfo.VisitStartTime,
        visitInfo.VisitEndTime,
        extractData
      );
    });

    // Use Promise.all to wait for all API calls to complete
    await Promise.all(visitPromises);
    const data = JSON.stringify(extractData);
    // After all API calls are done, print or return the extractData array
    // console.log(data);
    return extractData; // You can return it from here if needed
  } catch (error) {
    console.error("Error in GetVisitInfo:", error);
  }
};

// filterData function remains unchanged
const filterData = (
  PrebillingProblems,
  StartTime,
  EndTime,
  Patient,
  VisitStartTime,
  VisitEndTime,
  extractData
) => {
  const date = new Date(StartTime);
  const indexTopush = date.getDate();
  // const timeCompare = parseInt(StartTime.split(" ")[1]);

  extractData[indexTopush - 1].push({
    Prebilling: PrebillingProblems,
    Starttime: StartTime,
    EndTime: EndTime,
    Patient: Patient,
    VisitStartTime: VisitStartTime,
    VisitEndTime: VisitEndTime,
  });
  if (extractData[indexTopush - 1].length > 1) {
    extractData[indexTopush - 1].sort((visit1, visit2) => {
      function hourExtract(visit) {
        const DateA = new Date(visit.Starttime);
        return DateA.getHours();
      }

      return hourExtract(visit1) - hourExtract(visit2);
    });
    // console.log(
    //   parseInt(visit1.Starttime.split(" ")[1]),
    //   parseInt(visit2.Starttime.split(" ")[1])
    // );
  }
};

// Usage of GetVisitInfo function
export { GetVisitInfo };
