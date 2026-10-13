import Image from "next/image";

/** Le gabarit commun aux trois pages de connexion. */
export default function CarteAuth({
  titre,
  intro,
  children,
}: {
  titre: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cp-root a-auth">
      <div className="cp-card a-auth__card">
        <Image
          className="a-auth__logo"
          src="/caparel-logo.png"
          alt="Caparel — Aide à domicile aux personnes âgées"
          width={1872}
          height={562}
          priority
        />
        <h1 className="a-auth__title">{titre}</h1>
        <p className="a-auth__intro">{intro}</p>
        {children}
      </div>
    </div>
  );
}
