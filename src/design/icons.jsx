// v9.2 — Pictogrammes au trait (grille 24 px, trait 1,8) : un seul jeu pour toute l'interface.
// Décoratifs : toujours accompagnés d'un libellé texte (aria-hidden).
const P = {
  decision: <><path d="M3.5 10.6 12 3.6l8.5 7v9.1a1 1 0 0 1-1 1h-4.8v-6.2H9.3v6.2H4.5a1 1 0 0 1-1-1z"/></>,
  carte: <><path d="M9 4.2 3.5 6.4v13.4L9 17.6l6 2.2 5.5-2.2V4.2L15 6.4z"/><path d="M9 4.2v13.4M15 6.4v13.4"/></>,
  journal: <><path d="M12 6.4c-2.2-1.6-5-2.1-8-1.6v13.9c3-.5 5.8 0 8 1.6 2.2-1.6 5-2.1 8-1.6V4.8c-3-.5-5.8 0-8 1.6z"/><path d="M12 6.4v13.9"/></>,
  materiel: <><path d="M3.6 11.2c2.6-3.2 8.6-4.2 13.2-2.6L20.4 7l-.7 4.4.7 4.4-3.6-1.6c-4.6 1.6-10.6.6-13.2-3z"/><circle cx="7.4" cy="10.6" r=".9" fill="currentColor"/><path d="M10.6 14.6v2.6a1.6 1.6 0 0 0 3.2 0v-.8"/></>,
  plus: <><circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
  maree: <><path d="M3 15.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2"/><path d="M3 19.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2"/><path d="M12 3.5v7.5M9 8l3 3 3-3"/></>,
  meteo: <><path d="M3 8.5h11.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 12.5h15.5a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 16.5h7"/></>,
  saison: <><circle cx="12" cy="12" r="3.6"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6"/></>,
  regles: <><path d="M12 3.5v17M6 20.5h12"/><path d="M5 7.5h14"/><path d="m5 7.5-2.5 6a2.5 2.5 0 0 0 5 0zM19 7.5l-2.5 6a2.5 2.5 0 0 0 5 0z"/></>,
  photos: <><rect x="3" y="6.5" width="18" height="13" rx="2.5"/><path d="M8.5 6.5 10 4h4l1.5 2.5"/><circle cx="12" cy="13" r="3.4"/></>,
  reglages: <><path d="M4 7h9.5M18.5 7H20M4 17h3.5M12.5 17H20"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/></>,
  chevron: <><path d="m9 5 7 7-7 7"/></>,
  retour: <><path d="m15 5-7 7 7 7"/></>,
  check: <><path d="m4.5 12.5 4.6 4.5L19.5 6.5"/></>,
  attention: <><path d="M12 3.6 21 19.5H3z"/><path d="M12 9.5v4.6M12 16.9v.1"/></>,
  horloge: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
  vent: <><path d="M3 9h11a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 13h15a2.5 2.5 0 1 1-2.5 2.5"/></>,
  houle: <><path d="M2.5 14c2.2 0 2.6-4 5.4-4 2.4 0 2.4 3 4.6 3 1.4 0 1.8-1.4 1.8-2.4"/><path d="M2.5 18.5c1.6 0 1.6-1.2 3.2-1.2s1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2"/></>,
  eau: <><path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/></>,
  cible: <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></>,
};

export function Icon({ name, size = 22, color = "currentColor", stroke = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" style={{display:"block",flexShrink:0,...style}}>
      {P[name]}
    </svg>
  );
}
