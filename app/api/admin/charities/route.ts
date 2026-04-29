import { NextRequest } from "next/server";
import { json, requireUser } from "@/lib/api";
import { repository } from "@/lib/db/repository";

export async function POST(request: NextRequest) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;
  const body = await request.json();
  const charity = repository.charities.create({
    name: String(body.name ?? ""),
    description: String(body.description ?? ""),
    impact: String(body.impact ?? ""),
    location: String(body.location ?? ""),
    imageUrl: String(body.imageUrl ?? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80"),
    website: String(body.website ?? "example.org"),
    founded: String(body.founded ?? "2026"),
    focusAreas: Array.isArray(body.focusAreas) ? body.focusAreas : ["Community support"],
    upcomingEvents: Array.isArray(body.upcomingEvents) ? body.upcomingEvents : ["Impact open day"],
    raisedTodayBase: Number(body.raisedTodayBase ?? 1200),
    supporters: Number(body.supporters ?? 100)
  });
  return json({ charity }, 201);
}

export async function DELETE(request: NextRequest) {
  const user = await requireUser(request, "admin");
  if ("status" in user) return user;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ error: "Charity id is required." }, 400);
  const deleted = repository.charities.delete(id);
  return deleted ? json({ ok: true }) : json({ error: "Charity not found." }, 404);
}
