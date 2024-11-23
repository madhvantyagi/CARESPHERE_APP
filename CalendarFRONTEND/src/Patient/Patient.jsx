import "./Patient.css";
import StatusInfo from "../calendar UI/dotInfo.jsx";
import DateDisplay from "./FillInDate.jsx";
import RatioProgressBar from "./PorgressBar.jsx";

const ContractCard = ({ PatientData }) => {
  // Helper function to format date

  // Helper to determine if we should show FirstDay
  const shouldShowFirstDay = (status) => {
    return status === "Meet and Greet" || status === "Fill In";
  };

  return (
    <div className="Patient-Main-div">
      <div className="scroll-div">
        {PatientData.map((contract, index) => (
          <div
            className={`contract-card ${
              shouldShowFirstDay(contract.ContractStatus)
                ? "temporary-status"
                : ""
            }`}
            key={index}
          >
            <h3 className="contract-title">
              {contract.Contract === "N/A" ? (
                contract.PatientName
              ) : (
                <a
                  href={contract.Contract}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="title-link"
                >
                  {contract.PatientName}
                </a>
              )}
            </h3>

            {contract.LinkToPoc !== "N/A" && (
              <a
                href={contract.LinkToPoc}
                target="_blank"
                rel="noopener noreferrer"
                className="label"
              >
                Plan of Care
              </a>
            )}

            <ul className="contract-details">
              <li>
                <span className="label">Shift Status: </span>
                <span className="status-value">{contract.ContractStatus}</span>
              </li>
              <li>
  <span className="label">Pay Rate: </span>${contract.PayRate}
</li>

{shouldShowFirstDay(contract.ContractStatus) ? (
  <li>
    <span className="label">First Day: </span>
    {DateDisplay(contract.FirstDay)
      ? DateDisplay(contract.FirstDay)
      : contract.FirstDay}
  </li>
) : (
  <li>
    <span className="label">Weekly Hours: </span>
    {contract.HoursPerWeek}
  </li>
)}
            </ul>
  
            {/* Progress bar at the bottom */}
            {
     
        (contract.ContractStatus != "Fill In" && contract.ContractStatus !="Meet and Greet") ? (
          <div style={{ marginTop: "16px" }}>
            <RatioProgressBar
              current={Number(contract.HoursWorked) || 0}
              total={Number(contract.HoursPerWeek) || 0}
            />
          </div>
        ) : (
          
           <div style={{ marginTop: "61px" }}>
          
          </div>
       
        )
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractCard;
