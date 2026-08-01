import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  telephone: z.string().optional(),
  niveau: z.string().default("A1"),
})

const ONE_HOUR = 3_600_000
const MAX_REGISTRATIONS = 3

export async function POST(req: NextRequest) {
  // Rate limiting: max 3 registrations per IP per hour
  const ip = getClientIp(req)
  if (!rateLimit(`register:${ip}`, MAX_REGISTRATIONS, ONE_HOUR)) {
    return NextResponse.json(
      { success: false, error: "Trop de tentatives d'inscription. Veuillez réessayer dans une heure." },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.errors[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || "Données invalides" },
        { status: 400 }
      )
    }

    const { name, email, password, telephone, niveau } = result.data

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in DB
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        telephone: telephone || null,
        niveau,
      },
    })

    return NextResponse.json(
      { success: true, data: { message: "Compte créé avec succès" } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    )
  }
}
