/**
 * Les icônes de la charte Caparel (design-caparel), reprises du sprite de la
 * maquette. Les tracés sont dessinés sur une grille 24, sans remplissage : le
 * trait de 1,8 px et la taille viennent des classes `cp-icon*`.
 */
export type NomIcone =
  | "home"
  | "suivi"
  | "logout"
  | "chevron-left"
  | "chevron-right"
  | "clock"
  | "euro"
  | "calendar"
  | "check"
  | "plus"
  | "phone"
  | "menu"
  | "list"
  | "file"
  | "user"
  | "alert";

const TRACES: Record<NomIcone, React.ReactNode> = {
  home: (
    <>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </>
  ),
  suivi: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l4-4 3 3 5-6" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 16l-4-4 4-4" />
      <path d="M6 12h10" />
    </>
  ),
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  euro: (
    <>
      <path d="M17 6.5A7 7 0 1 0 17 17.5" />
      <path d="M4 10h9M4 14h9" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  list: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16h.01" />
    </>
  ),
};

export default function Icone({
  nom,
  taille,
}: {
  nom: NomIcone;
  /** `sm` 16 px, `xs` 14 px (trait plus épais). Par défaut 20 px. */
  taille?: "sm" | "xs";
}) {
  const classe = taille ? `cp-icon cp-icon--${taille}` : "cp-icon";

  return (
    <svg className={classe} viewBox="0 0 24 24" aria-hidden="true">
      {TRACES[nom]}
    </svg>
  );
}
