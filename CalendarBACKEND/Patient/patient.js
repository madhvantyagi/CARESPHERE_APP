import smartsheet from "smartsheet";
import dotenv from "dotenv";

dotenv.config();
// console.log(path);
const API_KEY = process.env.MAIN_API;
console.log(API_KEY);
const client = smartsheet.createClient({
  accessToken: API_KEY,
});
// authentication
const reportId = 4370378826665860;
const auth = {
  id: reportId,
  queryParameters: {
    pageSize: 15000,
  },
};

const searchContracts = async (careGiver) => {
  const ExactDataFromReport = [];
  try {
    const report = await client.reports.getReport(auth);

    report.rows.filter((row) => {
      const Data = GetData(row, careGiver);
      if (Data !== undefined && typeof Data === "object") {
        ExactDataFromReport.push(Data);
      }
    });
    // console.log(ExactDataFromReport);
    console.log(
      "----------------------------------------------------------------------------------"
    );
    return ExactDataFromReport;
  } catch (e) {
    console.log(e);
  }
};

const GetData = (row, careGiver) => {
  let patientName,
    LinkToPoc,
    contractStatus,
    hoursPerWeek,
    contract,
    payRate,
    ContractfirstDay,
    AdmissionID;
  try {
    if (careGiver === row.cells[0].displayValue) {
      console.log(row);
      console.log("------------------------------------rowends");
      for (var i of row.cells) {
        // console.log(i.columnId);

        if (i.columnId == 3672148641009540)
          patientName = row.cells[2].displayValue || "N/A";

        if (i.columnId == 8088831954734980) LinkToPoc = i.displayValue || "N/A";
        if (i.columnId == 1333432513679236)
          contractStatus = i.displayValue || "N/A";
        if (i.columnId == 3585232327364484) {
          hoursPerWeek = i.displayValue ? Number(parseFloat(i.displayValue).toFixed(2)) : "N/A";
        }
          
        if (i.columnId == 3486701950291844) contract = i.displayValue || "N/A";
        if (i.columnId == 5923948454694788) payRate = i.displayValue || "N/A";
        if (i.columnId == 8015761883746180) ContractfirstDay = i.value || "N/A";
        if (i.columnId == 3178130819993476)
          AdmissionID = i?.displayValue || "N/A";
      }

      if (contractStatus === "M&G Active" || contractStatus === "Active")
        contractStatus === "Active"
          ? (contractStatus = "Permanent")
          : (contractStatus = "Meet and Greet");
      const Data = {
        PatientName: patientName,
        LinkToPoc: LinkToPoc,
        ContractStatus: contractStatus,
        HoursPerWeek: hoursPerWeek,
        Contract: contract,
        PayRate: payRate,
        FirstDay: ContractfirstDay,
        PatientAdmissionID: AdmissionID,
      };

      return Data;
    } else {
    }
  } catch (e) {
    return;
  }
};

// export { searchContracts };

export { searchContracts };
