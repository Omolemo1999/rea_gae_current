"use client";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { Badge, Box, Divider, IconButton, List, ListItemButton, ListItemText, Popover, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

type NotificationItem = { id: string; title: string; message: string; type: string; readAt: string | null; createdAt: string };

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const load = async () => {
    const r = await fetch("/api/notifications", { cache: "no-store" });
    if (r.ok) { const d = await r.json(); setItems(d.notifications || []); }
  };
  useEffect(() => { load(); const id = window.setInterval(load, 30000); return () => window.clearInterval(id); }, []);
  const unread = items.filter((x) => !x.readAt).length;
  const open = Boolean(anchor);
  const mark = async (id: string) => { await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); setItems((old) => old.map((x) => x.id === id ? { ...x, readAt: new Date().toISOString() } : x)); };
  const markAll = async () => { await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }); setItems((old) => old.map((x) => ({ ...x, readAt: new Date().toISOString() }))); };
  return <>
    <IconButton aria-label="Notifications" onClick={(e) => setAnchor(e.currentTarget)} color="inherit"><Badge badgeContent={unread} color="error"><NotificationsNoneRoundedIcon /></Badge></IconButton>
    <Popover open={open} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
      <Box sx={{ width: { xs: "calc(100vw - 32px)", sm: 380 }, maxWidth: 380 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}><Typography fontWeight={800}>Notifications</Typography>{unread > 0 && <Typography onClick={markAll} sx={{ cursor: "pointer", color: "primary.main", fontSize: 13 }}>Mark all read</Typography>}</Stack><Divider />
        <List sx={{ maxHeight: 420, overflow: "auto", p: 0 }}>{items.length ? items.map((item) => <ListItemButton key={item.id} onClick={() => mark(item.id)} sx={{ alignItems: "flex-start", bgcolor: item.readAt ? "transparent" : "rgba(49,92,214,.05)" }}><ListItemText primary={item.title} secondary={<>{item.message}<br/><small>{new Date(item.createdAt).toLocaleString()}</small></>} /></ListItemButton>) : <Typography sx={{ p: 3, color: "text.secondary" }}>You're all caught up.</Typography>}</List>
      </Box>
    </Popover>
  </>;
}
