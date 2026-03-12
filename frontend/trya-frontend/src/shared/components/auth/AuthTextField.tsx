/**
 * AuthTextField Component
 * 
 * Reusable styled TextField for authentication forms
*/

'use client';

import { TextField, TextFieldProps } from '@mui/material';
type AuthTextFieldProps = Omit<TextFieldProps, 'sx'>

export default function AuthTextField(props: AuthTextFieldProps) {

  return (
    <TextField
      {...props}
    />
  );
}
