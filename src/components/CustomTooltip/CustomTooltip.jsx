import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "16px",
    whiteSpace: "nowrap",
    boxShadow: theme.shadows[1],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#333",
  },
}));

export default CustomTooltip;