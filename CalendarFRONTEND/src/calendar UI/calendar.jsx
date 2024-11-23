import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StatusInfo from "../calendar UI/dotInfo.jsx";

import axios from "axios";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import "./calendar.css";

import ShiftInformation from "./shiftInfo.jsx";

const Calendar = ({ Setmethod, visible, closePopup, caregiverCode }) => {
  const controllerRef = useRef();
  const tempReset = new Array(31).fill(null).map(() => []);
  const Days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const [mainTraverseArr, SetTraverseArr] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [colorChoose, setColor] = useState(false);
  const [valueChoose, SetValue] = useState("");
  // const [visible, setVisible] = useState(false);
  const [Actualevent, setEvent] = useState(
    mainTraverseArr[currentMonth.getDate() - 1]
  );
  const [tempdate, setTempDate] = useState(new Date());
  const [DatesOfMonth, SetDatesOfMonth] = useState([]);
  const [requestMonth, SetRequestMonth] = useState(new Date());
  const [booleantest, Setbooleantest] = useState(false);
  const ActualCurrentMonth = new Date();
  let validDateIndex = 0;
  // calling timesheet and setting it in state to pass down to shift as prop
  const [timesheetData, setTimesheetData] = useState([]);

  useEffect(() => {
    // Fetch timesheet data when component mounts
    const fetchTimesheetData = async () => {
      try {
        const response = await fetch(
          `https://connect-contract-backend.carespherehc.com/api/timesheet/${caregiverCode}`
        );
        const data = await response.json();
       
        setTimesheetData(await data[caregiverCode]);
      } catch (error) {
        console.error("Error fetching timesheet data:", error);
      }
    };

    fetchTimesheetData();
  }, []);

  const fetchData = async (month) => {
    const date = new Date(month);
    const year = date.getFullYear();
    const currmonth = date.getMonth();
    const firstDate = new Date(year, currmonth, 1);
    const firstDateFormatted = firstDate.toISOString().split("T")[0];
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    try {
      // Get the signal for Axios

      let response = await axios.get(
        `https://connect-contract-backend.carespherehc.com/api/caregiver/${firstDateFormatted}/${caregiverCode}`,
        { signal }
      );
      Setbooleantest(true);
      return response;
    } catch (err) {
      if (axios.isCancel(err)) return;
      else console.log(err);
    }
    // Return a cancel function
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchData(currentMonth);
        // console.log(data.data);
        if (data.data === undefined) {
          return;
        }

        SetTraverseArr(data.data);
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  }, [currentMonth]);
  //

  // console.log("Main rendering...");

  useEffect(() => {
    SetDatesOfMonth(dateDisplay(currentMonth));
  }, [currentMonth]);

  const SelectEvent = (event) => {
    // if (event.type === 'touchstart') {
    //   event.preventDefault();
    // }

    // console.log("doubleclickworking");
    const index = event?.target?.innerText;
    // console.log(index);
    let data;
    if (mainTraverseArr.length > index - 1) {
      data = mainTraverseArr[index - 1];
    } else {
      data = [];
    }

    setTempDate(
      Date.UTC(currentMonth.getFullYear(), currentMonth.getMonth(), index)
    );
    // console.log(data);
    setEvent(data);
    Setmethod(!visible);
  };

  const SelectDate = (value) => {
    // if (value.type === "touchstart") {
    //   value.preventDefault();
    // }

    const date = value.target.innerText;
    if (date === valueChoose) SetValue("");
    else SetValue(date);
    // console.log(colorChoose);
  };
  const Dates = [];
  const dateDisplay = (currentMonth) => {
    const firstDayMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const totalDaysMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate(); // Get the total number of days in the month

    const firstDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    for (let i = 0; i < firstDayMonth + totalDaysMonth; i++) {
      if (i < firstDayMonth) {
        Dates.push(" ");
        // console.log("this is inside the loop i m working");
      } else {
        // console.log("loop working");
        Dates.push(firstDate.getDate());
        firstDate.setDate(firstDate.getDate() + 1);
      }
    }
    return Dates;
  };

  const handlePrevMonth = () => {
    SetTraverseArr(tempReset);
    const newDate = new Date(currentMonth); // Clone the current Date object
    newDate.setMonth(currentMonth.getMonth() - 1); // Update the month
    setCurrentMonth(newDate);
    // fetchData(currentMonth);
  };

  const handleNextMonth = () => {
    SetTraverseArr(tempReset);
    const newDate = new Date(currentMonth); // Clone the current Date object
    newDate.setMonth(currentMonth.getMonth() + 1); // Update the month
    setCurrentMonth(newDate);
    // fetchData(currentMonth);
  };

  return (
    <>
      {visible && (
        <ShiftInformation
          style={{ filter: "unset" }}
          date={Actualevent}
          className={visible ? "visible" : "notvisible"}
          XMethod={SelectEvent}
          tempdate={tempdate}
          timesheetData={timesheetData}
        />
      )}
      <div
        className={`MainDiv ${visible ? "ApplyOpacity" : "NotApplyOpacity"}`}
        onClick={closePopup}
      >
        <div className={`calendar `}>
          <div className="block-icon-div">
            <StatusInfo />
          </div>
          {/* Making header for buttons and name of the month */}
          <div className="header">
            {/* This is the left button */}
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="button"
              onClick={handlePrevMonth}
            />
            {/* </button> */}
            <div className="current-month">
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {currentMonth.getFullYear()}
            </div>
            {/* This is the right button */}
            <FontAwesomeIcon
              icon={faChevronRight}
              onClick={handleNextMonth}
              className="button"
            />
          </div>

          {/* ------------------------------------------------------------------- */}

          {/* Dates grid so we can put  the dates  */}
          <div className="calendar-grid">
            {Days.map((day, index) => {
              return (
                <div key={index} className="calendar-day-header">
                  {day}
                </div>
              );
            })}
            {/* ------------------------------------------------------------------------- */}
            {/* Actual dates goes here */}
      
            {DatesOfMonth.map((date, index) => {
              if (date === " ")
                return <div className="calendar-date-grid"></div>;
              else {
                const currentValidIndex = validDateIndex; // Store the current valid index for use in this iteration
                validDateIndex++;
                return (
                  <div key={index} className="calendar-date-grid">
                    <span
                      key={index}
                      className={`calendar-grid-${
                        valueChoose === date ||
                        (ActualCurrentMonth.getMonth() ===
                          currentMonth.getMonth() &&
                          ActualCurrentMonth.getDate() === date &&
                          valueChoose === "")
                          ? "darkcolor"
                          : "lightcolor"
                      }`}
                      onClick={(event) => {
                        SelectDate(event);
                        SelectEvent(event);
                      }}
                    >
                      {" "}
                      {date}
                    </span>
                    <div className="parentDot">
                      {booleantest ? (
                        mainTraverseArr[currentValidIndex].map(
                          (ActualItem, i) => {
                            const compareDate = new Date(ActualItem.Starttime);
                            const todayDatecompare = new Date();
                            if (compareDate > todayDatecompare) {
                              return <span key={i} className="dots"></span>;
                            } else if (
                              (ActualItem.Prebilling === null &&
                                ActualItem.VisitStartTime !== "" &&
                                ActualItem.VisitEndTime !== "") ||
                              (ActualItem.Prebilling.PrebillingProblemInfo
                                .length == 1 &&
                                ActualItem.Prebilling.PrebillingProblemInfo[0]
                                  .Problem == "Caregiver Compliance")
                            ) {
                              return (
                                <span key={i} className="dotsGreen"></span>
                              );
                            } else if (ActualItem.Prebilling !== null) {
                              return <span key={i} className="dotsRed"></span>;
                            }
                          }
                        )
                      ) : (
                        <span
                          style={{ fontSize: "0.5rem" }}
                          className="Loading"
                        >
                          Loading...
                        </span>
                      )}
                    </div>{" "}
                  </div>
                );
              }
            })}
            {/* --------------------------------------------------------------------------- */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;
