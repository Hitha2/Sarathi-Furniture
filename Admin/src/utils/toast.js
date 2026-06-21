import { toast } from "react-toastify";
// Success Toast
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
    style: {
      background: "#ffffff",
      color: "#2f5d5b",
      borderLeft: "6px solid #2f5d5b",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    progressStyle: {
      background: "#d57b0c",
    },
  });
};

// Error Toast
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    style: {
      background: "#ffffff",
      color: "#d57b0c",
      borderLeft: "6px solid #d57b0c",
      fontWeight: "600",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    progressStyle: {
      background: "#2f5d5b",
    },
  });
};