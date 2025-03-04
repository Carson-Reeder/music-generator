import "../../globals.css";
import dynamic from "next/dynamic";

const Arrangement = dynamic(() => import("./components/Arrangement/page"));
const Header = dynamic(() => import("./components/Header/page"));

// Arrangements will be saved as a file so user can leave site and resume work
// They will be able to have multiple arrangements stores on their account
// For now there is one arrangement

export default function MyPage() {
  console.log("RERENDER page.tsx");

  // Handles updating chords in the first store

  return (
    <div>
      <Header />
      <Arrangement />
    </div>
  );
}
