
import React from "react";

export function useDisclosure(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const onOpen = React.useCallback(() => setOpen(true), []);
  const onClose = React.useCallback(() => setOpen(false), []);
  const onToggle = React.useCallback(() => setOpen((v) => !v), []);
  return { open, onOpen, onClose, onToggle, setOpen };
}
