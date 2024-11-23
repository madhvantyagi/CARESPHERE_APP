import React, { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import "./dotInfo.css";

const StatusInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleInfo = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="info-icon-wrapper" ref={wrapperRef}>
      <div onClick={toggleInfo}>
        <Info className="info-icon" />
      </div>

      {isOpen && (
        <div className={`info-popup ${isOpen ? "visible" : ""}`}>
          <div className="status-item">
            <span className="status-emoji">🟢</span>
            <p className="status-text">
              <span className="status-label">Green:</span> Visit Complete – The
              visit has been successfully completed and recorded.
            </p>
          </div>

          <div className="status-item">
            <span className="status-emoji">🟡</span>
            <p className="status-text">
              <span className="status-label">Yellow:</span> Pending Visit – The
              visit is scheduled but has not yet been conducted
            </p>
          </div>

          <div className="status-item">
            <span className="status-emoji">🔴</span>
            <p className="status-text">
              <span className="status-label">Red:</span> There is an issue with
              the visit that needs to be addressed before this visit can be
              paid. Please check the visit details on what is needed and contact
              us immediately to get it resolved
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusInfo;
