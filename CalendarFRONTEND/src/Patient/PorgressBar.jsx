import React, { useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { Box, Modal, IconButton } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";


const RatioProgressBar = ({ current = 0, total = 100 }) => {
  const [openModal, setOpenModal] = useState(false);
  const getStartDate = () => {
    const today = new Date();
    const lastSaturday = new Date(today);
    const daysToSubtract = (today.getDay() + 1) % 7;
    lastSaturday.setDate(today.getDate() - daysToSubtract);
    return lastSaturday;
  };
  
  const getEndDate = () => {
    const today = new Date();
    // If it's Friday, return today
    if (today.getDay() === 5) {
      return today;
    }
    // If it's Saturday, calculate next Friday
    if (today.getDay() === 6) {
      const nextFriday = new Date(today);
      nextFriday.setDate(today.getDate() + 6); // Add 6 days to get to Friday
      return nextFriday;
    }
    // For all other days, calculate this week's Friday
    const daysUntilFriday = 5 - today.getDay();
    const thisFriday = new Date(today);
    thisFriday.setDate(today.getDate() + daysUntilFriday);
    return thisFriday;
  };
  
  const formatDateRange = () => {
    const startDate = getStartDate();
    const endDate = getEndDate();
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    };
  
    return `Week ${formatDate(startDate)} to ${formatDate(endDate)}`;
  };

  const percentage = total === 0 ? 101 : (current / total) * 100;
  const isOverflow = current > total;
  const isComplete = current === total && current != 0 && total !== 0;

  const getColor = () => {
    if (isOverflow) return "#ff4444";
    if (isComplete) return "#ffd700";
    return "#4d9aa6";
  };

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 24,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Box sx={{ flexGrow: 1, position: "relative" }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            sx={{
              width: "100%",
              height: 24,
              borderRadius: 2,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: getColor(),
                transition: "background-color 0.3s ease",
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: percentage > 50 ? "white" : "black",
              fontWeight: "bold",
              fontSize: "0.875rem",
              transition: "color 0.3s ease",
              pointerEvents: "none",
            }}
          >
            {current}/{total} hrs
          </Box>
        </Box>

        {/* Status Icons Container */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {isComplete && (
            <Box
              sx={{
                fontSize: "1.25rem",
                display: "flex",
                alignItems: "center",
              }}
              role="img"
              aria-label="achievement medal"
            >
              🏅
            </Box>
          )}

          {isOverflow && (
            <IconButton
              onClick={handleOpen}
              sx={{
                color: "#ff4444",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(255, 68, 68, 0.1)",
                },
              }}
            >
              <ErrorOutlineIcon />
            </IconButton>
          )}
        </Box>

        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="hours-exceeded-modal"
          aria-describedby="hours-exceeded-description"
        >
          {/* Modal content remains the same */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxWidth: "90vw",
              width: 400,
              outline: "none",
              border: "2px solid #ff4444",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
              }}
            >
              <ErrorOutlineIcon sx={{ color: "#ff4444", fontSize: 40 }} />
              <h2
                id="hours-exceeded-modal"
                style={{
                  color: "#ff4444",
                  margin: 0,
                  fontWeight: "bold",
                }}
              >
                Hours Exceeded
              </h2>
              <p
                id="hours-exceeded-description"
                style={{
                  margin: 0,
                  color: "#ff4444",
                  fontWeight: "bold",
                }}
              >
                Exceeded Assigned Hours:
                <br />
                Contact Your Coordinator Immediately.
              </p>
            </Box>
          </Box>
        </Modal>
      </Box>
      
      {/* Date Range Display */}
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          marginTop: "8px",
          fontSize: "0.75rem",
          fontWeight: "bold",
          color: "#ff7a00;"
        }}
      >
        {formatDateRange()}
      </Box>
    </Box>
  );
};

export default RatioProgressBar;