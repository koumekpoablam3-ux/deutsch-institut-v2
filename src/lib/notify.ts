import { db } from "@/lib/db";

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}) {
  try {
    await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || "info",
        link: params.link,
      },
    });
  } catch (error) {
    // Une notification manquée ne doit jamais faire échouer l'action principale
    console.error("Erreur création notification:", error);
  }
}
