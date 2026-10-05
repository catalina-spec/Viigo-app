const PATHS: Record<string, string> = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h6M18 9v6a4 4 0 0 1-4 4H8',
  building: 'M4 21V5l8-3v19M12 8l8 3v10M8 9h.01M8 13h.01M8 17h.01M16 14h.01M16 18h.01M2 21h20',
  video: 'M15 10l5-3v10l-5-3M3 7h12v10H3z',
  sheet: 'M4 4h16v16H4zM4 9h16M4 14h16M10 4v16',
  book: 'M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2zM4 21V5',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  slides: 'M3 4h18v12H3zM12 16v4M8 20h8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};

export function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={name === 'more' ? 3.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.more} />
    </svg>
  );
}
