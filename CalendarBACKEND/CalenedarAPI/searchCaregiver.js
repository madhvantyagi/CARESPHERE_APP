import soap from "soap";
import dotenv from "dotenv";
dotenv.config();
const { APP_NAME, APP_SECRET, APP_KEY } = process.env;
console.log(APP_NAME, APP_SECRET, APP_KEY);

const url = "https://app2.hhaexchange.com/integration/ent/v1.8/ws.asmx?WSDL";

const searchCaregiver = async (caregiver) => {
  const args = {
    Authentication: {
      AppName: APP_NAME,
      AppSecret: APP_SECRET,
      AppKey: APP_KEY,
    },
    SearchFilters: {
      CaregiverCode: caregiver,
    },
  };

  const client = await soap.createClientAsync(url);
  try {
    const result = await client.SearchCaregiversAsync(args);
    console.log(
      JSON.stringify(result[0].SearchCaregiversResult.Caregivers.CaregiverID[0])
    );
    return result[0].SearchCaregiversResult.Caregivers.CaregiverID[0];
  } catch (e) {
    console.log(`err: ${e}`);
  }
};

// searchCaregiver();
export { searchCaregiver };
