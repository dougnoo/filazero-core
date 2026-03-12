'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A3A3A',
    },
    secondary: {
      main: '#BEE1EB',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Chivo, sans-serif',
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [{ cache: emotionCache, flushStyles }] = React.useState(() => {
    const cache = createCache({ key: 'mui', prepend: true });
    cache.compat = true;

    const prevInsert = cache.insert;
    let inserted: string[] = [];

    cache.insert = (...args) => {
      const [, serialized] = args;
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flushStyles = () => {
      const names = [...inserted];
      inserted = [];
      return names;
    };

    return { cache, flushStyles };
  });

  useServerInsertedHTML(() => {
    const names = flushStyles();
    if (names.length === 0) {
      return null;
    }

    const styles = names
      .map((name) => emotionCache.inserted[name])
      .join('');

    return (
      <style
        key={emotionCache.key}
        data-emotion={`${emotionCache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={emotionCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
