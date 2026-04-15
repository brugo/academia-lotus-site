import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { startOfDay, addDays, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const therapistEmail = searchParams.get('email');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!therapistEmail) {
    return NextResponse.json({ error: "E-mail do terapeuta é obrigatório" }, { status: 400 });
  }

  try {
    // Busca dinâmica ou default 14 dias
    const timeMin = startParam ? new Date(startParam) : startOfDay(new Date());
    const timeMax = endParam ? new Date(endParam) : endOfDay(addDays(new Date(), 14));

    // A API Free/Busy do Google nos retorna onde a agenda está OCUPADA.
    // O Frontend vai pegar o ocupado e inverter para mostrar os buracos livres.
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "America/Sao_Paulo",
        items: [{ id: therapistEmail }],
      },
    });

    const busySlots = response.data.calendars?.[therapistEmail]?.busy || [];

    return NextResponse.json({ 
      success: true, 
      busySlots,
      timeMin,
      timeMax
    });
  } catch (error: any) {
    console.error("Erro na API do Google Calendar:", error);
    return NextResponse.json({ error: "Falha ao consultar disponibilidade" }, { status: 500 });
  }
}
