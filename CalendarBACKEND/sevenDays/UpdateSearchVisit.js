import soap from "soap";
import dotenv from "dotenv";
dotenv.config();
import { searchCaregiver } from "../sevenDays/searchCaregiver.js";

const { APP_NAME, APP_SECRET, APP_KEY } = process.env;
const url = "https://app2.hhaexchange.com/integration/ent/v1.8/ws.asmx?WSDL";

const UpdateSearchVisit = async (Id, month) => {
  const monthyear = month.split("-")[0];
  const monthMonth = month.split("-")[1];
  const monthdate = month.split("-")[2];
  const newMonth = monthMonth - 1;
  const date = new Date(monthyear, newMonth, monthdate);
  // Getting year and month from this date
  const year = date.getFullYear();
  const currmonth = date.getMonth(); // 0-based, so January is 0, December is 11

  const CaregiverID = await searchCaregiver(Id);
  const firstDate = new Date(year, currmonth, 1);
  const lastDate = new Date(year, currmonth + 1, 0);
  const firstDateFormatted = firstDate.toISOString().split("T")[0];
  const lastDateFormatted = lastDate.toISOString().split("T")[0];
  const args = {
    Authentication: {
      AppName: APP_NAME,
      AppSecret: APP_SECRET,
      AppKey: APP_KEY,
    },
    SearchFilters: {
      StartDate: firstDateFormatted,
      EndDate: lastDateFormatted,
      CaregiverID: CaregiverID,
    },
  };

  const client = await soap.createClientAsync(url);
  try {
    const result = await client.SearchVisitsAsync(args);
    if (result[0].SearchVisitsResult?.Visits?.VisitID == undefined) return [];
    const ActualResult = result[0].SearchVisitsResult?.Visits?.VisitID;
    return ActualResult;
  } catch (e) {
    console.log("Error in SearchVisits:", e);
  }
};

export { UpdateSearchVisit };
