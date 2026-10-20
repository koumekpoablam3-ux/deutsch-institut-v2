import { NextResponse } from "next/server";
import { getAdmissionState, getSessionInfo } from "@/lib/admission-server";

// Résumé léger utilisé par la connexion, le tableau de bord et la page d'un cours
export async function GET() {
  const me = await getSessionInfo();
  if (!me) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const state = await getAdmissionState(me.userId, me.role);
    return NextResponse.json({ ...state, needsDossier: me.role !== "admin" && !state.canEnroll });
  } catch (err) {
    console.error("Application status error:", err);
    // En cas de souci (table absente…), on ne bloque personne
    return NextResponse.json({ required: false, status: "none", canEnroll: true, needsDossier: false });
  }
}
