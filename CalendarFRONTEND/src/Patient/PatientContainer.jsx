import React, { useEffect, useState } from "react";
import axios from "axios";
import ContractCard from "./Patient";
import "./PatientContainer.css";

const ContractContainer = ({ visible, closePopup, caregiverCode }) => {
  const [renderbool, setRenderBool] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const getStartDate = () => {
    const today = new Date();
    // Convert to start of day in local timezone
    today.setHours(0, 0, 0, 0);
    
    // If today is Saturday (6), use today's date
    if (today.getDay() === 6) {
      return today;
    }
    
    const lastSaturday = new Date(today);
    const daysToSubtract = (today.getDay() + 1) % 7;
    lastSaturday.setDate(today.getDate() - daysToSubtract);
    return lastSaturday;
  };
  
  const calculateHoursForDateRange = (hoursData) => {
    if (!Array.isArray(hoursData)) {
      return 0;
    }
  
    const today = new Date();
    const startDate = getStartDate();
    
    // Set time boundaries for comparison
    startDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);
  
    const totalHours = hoursData.reduce((sum, dayRecord) => {
      try {
        // Parse the date string directly without UTC conversion
        const [year, month, dayOfMonth] = dayRecord.Date.split('-').map(Number);
        const dayDate = new Date(year, month - 1, dayOfMonth);
        dayDate.setHours(0, 0, 0, 0);
  
        // Compare dates in local timezone
        if (dayDate >= startDate && dayDate <= today) {
          const hours = parseFloat(dayRecord.HoursWorked);
          return sum + (isNaN(hours) ? 0 : hours);
        }
        return sum;
      } catch (error) {
        console.error('Error parsing date:', error, dayRecord);
        return sum;
      }
    }, 0);
  
    // Handle rounding
    const wholeNumber = Math.floor(totalHours);
    const decimal = totalHours - wholeNumber;
  
    if (decimal >= 0.75) {
      return wholeNumber + 1;
    }
    return Number(totalHours.toFixed(2));
  };
  useEffect(() => {
    const fetchHoursWorked = async (admissionIds) => {
      try {
        const response = await axios.get(
          `https://connect-contract-backend.carespherehc.com/api/caregiver/hoursworked/2024-11-01/${caregiverCode}`
        );

        if (!response.data || typeof response.data !== "object") {
          return {};
        }

        // Create an object with hours worked for each admission ID
        const hoursWorkedByAdmission = {};

        // Process only the admission IDs we're interested in
        admissionIds.forEach((admissionId) => {
          if (response.data[admissionId]) {
            hoursWorkedByAdmission[admissionId] = calculateHoursForDateRange(
              response.data[admissionId]
            );
          } else {
            hoursWorkedByAdmission[admissionId] = 0;
          }
        });

        return hoursWorkedByAdmission;
      } catch (error) {
        console.error("Error fetching hours worked:", error);
        return {};
      }
    };

    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `https://connect-contract-backend.carespherehc.com/api/patient/${caregiverCode}`
        );

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          // Get all admission IDs from patient data
          const admissionIds = response.data
            .filter((patient) => patient?.PatientAdmissionID) // Only include patients with valid admission IDs
            .map((patient) => patient.PatientAdmissionID);

          // Fetch hours worked for these admission IDs
          const hoursData = await fetchHoursWorked(admissionIds);

          // Combine patient data with hours worked
          const enhancedPatientData = response.data.map((patient) => ({
            ...patient,
            HoursWorked: patient?.PatientAdmissionID
              ? hoursData[patient.PatientAdmissionID] || 0
              : 0,
          }));

          setPatientData(enhancedPatientData);
          setRenderBool(true);
        } else {
          setRenderBool(false);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setRenderBool(false);
      }
    };

    if (caregiverCode) {
      fetchPatientData();
    }
  }, [caregiverCode]);

  return (
    <div
      className={`${
        visible ? "ApplyOpacity" : "NotApplyOpacity"
      } contract-container`}
    >
      {renderbool ? (
        <ContractCard visible={visible} PatientData={patientData} />
      ) : (
        <div className="block">
          <p className="message">No Active Shifts</p>
          <a href="https://app.mapsly.com/map/8c4d93a6449a405d95f8c9d67ee0df23">
            Click to Request Cases
          </a>
        </div>
      )}
    </div>
  );
};

export default ContractContainer;
