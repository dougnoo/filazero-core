"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { getNotificationCategory } from "@/shared/constants/notificationCategories";
import { NotificationsOutlined } from "@mui/icons-material";

export const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, count, isLoading, handleNotificationClick } =
    useNotifications();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleItemClick = async (notification: any) => {
    await handleNotificationClick(notification);
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 48,
          height: 48,
          backgroundColor: open ? 'secondary.main' : 'secondary.light',
          "&:hover": {
            backgroundColor: 'secondary.main',
          },
        }}
      >
        <Badge
          badgeContent={count}
          color="error"
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#FF4D4F",
              color: "white",
              fontSize: "11px",
              height: "18px",
              minWidth: "18px",
              padding: "0 4px",
            },
          }}
        >
          <NotificationsOutlined
            sx={{
              fontSize: 24,
            }}
          />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          mt: 1,
        }}
      >
        <Box
          sx={{
            width: 380,
            maxHeight: 500,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                 
              }}
            >
              Notificações
            </Typography>
          </Box>

          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={32} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                px: 3,
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "grey.800",
                }}
              >
                Nenhuma notificação
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                p: 0,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      bgcolor: notification.read
                        ? "background.paper"
                        : "action.hover",
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleItemClick(notification)}
                      sx={{
                        px: 3,
                        py: 2,
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                        "&:hover": {
                          bgcolor: notification.read
                            ? "action.hover"
                            : "action.selected",
                        },
                      }}
                    >
                      {(() => {
                        const categoryConfig = getNotificationCategory(
                          notification.category
                        );
                        const IconComponent = categoryConfig.icon;

                        return (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: 'secondary.light',
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          >
                            <IconComponent
                              sx={{
                                fontSize: 20,
                                color: "primary.main",
                              }}
                            />
                          </Box>
                        );
                      })()}

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "14px",
                            fontWeight: 600,
                             
                            mb: 0.5,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "grey.800",
                            lineHeight: 1.5,
                          }}
                        >
                          {notification.message}
                        </Typography>
                      </Box>

                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            flexShrink: 0,
                            mt: 1,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};
