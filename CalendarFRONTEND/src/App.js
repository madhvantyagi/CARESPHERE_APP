import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./App.css";

import Calendar from "./calendar UI/calendar.jsx";
import ContractContainer from "./Patient/PatientContainer.jsx";

function App() {
  const [visible, setVisible] = useState(false);
  const [searchParams] = useSearchParams();

  return (
    <div className="App">
      <ContractContainer
        visible={visible}
        caregiverCode={searchParams.get("caregiverCode")}
      />
      <Calendar
        visible={visible}
        Setmethod={setVisible}
        caregiverCode={searchParams.get("caregiverCode")}
      />
    </div>
  );
}

export default App;
