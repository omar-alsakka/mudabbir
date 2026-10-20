import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, preferredLang } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        preferredLang: preferredLang ?? "en",
      },
      select: { id: true, email: true, name: true },
    });

    return Response.json(user, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
