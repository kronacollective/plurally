'use client';
import { Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const ERROR_MAP = {
  'hook(.+)403': 'The invite code is not valid.',
}

export default function AuthCodeError() {
  const [ hash, setHash ] = useState<Record<string, string>>({});

  useEffect(() => {
    const hash = window.location.hash;
    const variables = hash.split('&');
    const kv_pairs = variables.map(variable => variable.split('='));
    const decoded_kv_pairs = kv_pairs.map(([key, val]) => [key, decodeURI(decodeURI(val)).replaceAll('+', ' ')])
    const set = () => setHash(Object.fromEntries(decoded_kv_pairs));
    set();
  }, []);

  const error = useMemo(() => {
    if (!hash.error_description) return;
    return Object
      .entries(ERROR_MAP)
      .map(([K, T]) => hash.error_description.match(K)?.[0] && T)
      .filter(x => x)
      .at(0);
  }, [hash]);

  return (
    <Container sx={{ p: 5 }}>
      <Typography variant="h1">Error!</Typography>
      <Typography>{error ?? hash.error_description}</Typography>
    </Container>
  )
}