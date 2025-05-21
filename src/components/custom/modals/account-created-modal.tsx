import React, { useState, useCallback } from 'react';
import { Popup } from '@/components/common/popup';

export const AccountCreatedModal: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  if (!open) return null;
  return (
    <Popup
      variant="success"
      title="Created account"
      description="Your Chromia account has been created successfully."
      buttonText="Continue"
      onButtonClick={onClose}
    />
  );
};

export function useAccountCreatedModal() {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);
  const modal = <AccountCreatedModal open={open} onClose={hide} />;
  return { open, show, hide, modal };
}
