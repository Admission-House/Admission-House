import { permanentRedirect } from "next/navigation";

// The full list of online colleges now lives on the Online page itself.
export default function OnlineUniversitiesPage() {
  permanentRedirect("/online#colleges");
}
