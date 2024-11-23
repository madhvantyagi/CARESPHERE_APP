import React, { useEffect, useState } from "react";
import "./shiftinfo.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

const ShiftInformation = ({
  date,
  className,
  XMethod,
  tempdate,
  timesheetData,
}) => {


  const findTimesheetLink = (shift) => {
    if (!timesheetData || !shift.Patient?.AdmissionNumber) return null;

    const shiftAdmissionNumber = shift.Patient.AdmissionNumber;

    // Parse the original time strings directly without UTC conversion
    const getTimeFromString = (timeString) => {
      // Handle different possible time formats
      const date = new Date(timeString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    const getLocalDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    };

    // Get times from the original strings
    const shiftStartTime = getTimeFromString(shift.VisitStartTime);
    const shiftEndTime = getTimeFromString(shift.VisitEndTime);
    const shiftDate = getLocalDate(shift.Starttime);

    if (!timesheetData[shiftAdmissionNumber]) {

      return null;
    }

    const visits = timesheetData[shiftAdmissionNumber];

    // Find matching visit with improved time comparison
    const matchingVisit = visits.find((visit) => {
      const timeMatch =
        visit.startTime === shiftStartTime || visit.endTime === shiftEndTime;
      const dateMatch = visit.dateOfService === shiftDate;

      return dateMatch && timeMatch;
    });

    if (matchingVisit) {
  
      if(matchingVisit.timesheetLink=="N/A")return null;
      return matchingVisit.timesheetLink;
    }


    return null;
  };
  const currentDate = new Date();
  const weekName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const formatTo12HourTime = (shifttime) => {
    const date = new Date(shifttime);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return hours + ":" + formattedMinutes + " " + ampm;
  };

  const getDaySuffix = (date) => {
    const day = date.getUTCDate();
    if (day >= 11 && day <= 13) return day + "th";

    switch (day % 10) {
      case 1:
        return day + "st";
      case 2:
        return day + "nd";
      case 3:
        return day + "rd";
      default:
        return day + "th";
    }
  };

  const getStatusClass = (shift) => {
    const compareDate = new Date(shift.Starttime);
    const todayDatecompare = new Date();

    if (compareDate > todayDatecompare) {
      return "shift-timing-yellow";
    } else if (
      (shift.Prebilling === null &&
        shift.VisitStartTime !== "" &&
        shift.VisitEndTime !== "") ||
      (shift.Prebilling.PrebillingProblemInfo.length == 1 &&
        shift.Prebilling.PrebillingProblemInfo[0].Problem ===
          "Caregiver Compliance")
    ) {
      return "shift-timing-green";
    } else if (shift.Prebilling !== null) {
      return "shift-timing-red";
    }
    return "";
  };
  // console.log(getStatusClass);

  const selectDate = new Date(tempdate);
  const isToday =
    currentDate.getFullYear() === selectDate.getFullYear() &&
    currentDate.getMonth() === selectDate.getMonth() &&
    currentDate.getDate() === selectDate.getDate();

  return (
    <div
      className={`shiftInfo ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="closing-X">
        <div className="emptyDiv"></div>
        <div className="visitDate">
          {isToday ? (
            <>
              Today {weekName[selectDate.getUTCDay()]}{" "}
              {getDaySuffix(selectDate)}
            </>
          ) : (
            <>
              {weekName[selectDate.getUTCDay()]} {getDaySuffix(selectDate)}
            </>
          )}
        </div>
        <div className="XIcon" onClick={XMethod}>
          <FontAwesomeIcon icon={faX} className="smallIcon" />
        </div>
      </div>

      <div className="shift-Main-div">
        {date.length < 1 ? (
          <div className="shift-timing-patient No-shifts-patient">
            No Scheduled Shifts
          </div>
        ) : (
          date.map((shift, index) => {
   
            let timesheetbool = false;
            let timesheetLink;

            // Check if any prebilling problem is "Timesheet Not Approved"
            if(shift.Prebilling!=null){
            for (let index of shift.Prebilling.PrebillingProblemInfo) {
          
              if (index.Problem === "Timesheet Not Approved")
                timesheetbool = true;
            }

           
            if (timesheetbool) timesheetLink = findTimesheetLink(shift);
          }

            const statusClass = getStatusClass(shift);

            const translateProblem = (problem) => {
              switch (problem) {
                case "POC Compliance":
                  return "Missing Duties";
                case "Incomplete Confirmation":
                  return "Missing clock in/out";
                default:
                  return problem;
              }
            };

            if (timesheetbool && statusClass === "shift-timing-red") {
              // Return component with timesheet link
              return (
                <div
                  key={index}
                  className={`shift-timing-patient ${statusClass}`}
                >
                  <div className="shift-time">
                    <span className="label">Time of Shift: </span>
                    {formatTo12HourTime(shift.Starttime) +
                      " - " +
                      formatTo12HourTime(shift.EndTime)}
                  </div>
                  <div className="patient-name">
                    <span className="label">Patient Name: </span>
                    {shift?.Patient?.FirstName + " " + shift?.Patient?.LastName}
                  </div>
                  {timesheetLink ? (
                    <div className="timesheet-link">
                      <span className="label">Timesheet Link: </span>
                      <a
                        href={timesheetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Open Timesheet
                      </a>
                    </div>
                  ) : (
                    <div className="timesheet-link">
                      <span className="label">Timesheet Status: </span>
                      <span className="link">No timesheet available</span>
                    </div>
                  )}
                </div>
              );
            } else {
              // Return component with prebilling issues
              return (
                <div
                  key={index}
                  className={`shift-timing-patient ${statusClass}`}
                >
                  <div className="shift-time">
                    <span className="label">Time of Shift: </span>
                    {formatTo12HourTime(shift.Starttime) +
                      " - " +
                      formatTo12HourTime(shift.EndTime)}
                  </div>
                  <div className="patient-name">
                    <span className="label">Patient Name: </span>
                    {shift?.Patient?.FirstName + " " + shift?.Patient?.LastName}
                  </div>
                  {statusClass === "shift-timing-red" && (
  <div className="prebilling-issues">
    {shift.Prebilling.PrebillingProblemInfo
      .filter(problem => translateProblem(problem.Problem) !== "Caregiver Compliance")
      .map((problem, idx) => (
        <div key={idx} className="problem-item">
          <span className="label">Problem: </span>
          <span className="link">
            {translateProblem(problem.Problem)}
          </span>
        </div>
      ))}
  </div>
)}
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default ShiftInformation;
