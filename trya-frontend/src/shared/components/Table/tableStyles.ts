import { SxProps, Theme } from "@mui/material";

export const tableContainerStyles: SxProps<Theme> = {
  borderRadius: "12px",
  boxShadow: "0px 8px 24px rgba(6,36,36,0.06)",
};

export const tableCellStyles: SxProps<Theme> = {
  "& .MuiTableCell-root": {
    borderRight: "1px solid #E5E7EB",
    borderBottom: "1px solid #E5E7EB",
    "&:last-child": {
      borderRight: "none",
    },
  },
  "& .MuiTableHead-root .MuiTableCell-root": {
    borderRight: "none",
    borderBottom: "1px solid #E5E7EB",
  },
};

export const tableHeaderRowStyles: SxProps<Theme> = {
  bgcolor: "#F8F9FA",
};

export const emptyTableCellStyles: SxProps<Theme> = {
  py: 8,
};
