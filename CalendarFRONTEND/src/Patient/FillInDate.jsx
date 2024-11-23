import React, { useState } from "react";
import "./FillinDate.css";

const DateDisplay = (dateStr) => {
  const [dates, setDates] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    const splitDates = dateStr.split(",");
    setDates(splitDates);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="date-display-container">
      <div onClick={handleButtonClick} className="show-dates-btn">
        Show Dates
      </div>

      {showPopup && (
        <div className="dates-popup">
          <div className="popup-header">
            <span className="popup-title">First Dates</span>
            <button
              onClick={handleClosePopup}
              className="popup-close"
              aria-label="Close popup"
            >
              <svg
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="dates-container">
            {dates.map((date, index) => (
              <div key={index} className="date-item">
                {date}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateDisplay;
