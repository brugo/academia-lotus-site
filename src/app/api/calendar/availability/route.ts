import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { startOfDay, addDays, endOfDay } from "date-fns";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const therapistEmail = searchParams.get('email');
  const therapistId = searchParams.get('therapist_id');
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
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "America/Sao_Paulo",
        items: [{ id: therapistEmail }],
      },
    });

    const busySlots = response.data.calendars?.[therapistEmail]?.busy || [];

    // Buscar regras de disponibilidade do terapeuta no Supabase
    let availabilityRules: any[] = [];
    if (therapistId) {
      try {
        const supabase = await createClient();
        const { data } = await supabase
          .from("therapist_availability")
          .select("*")
          .eq("therapist_id", therapistId);
        availabilityRules = data || [];
      } catch (dbError) {
        console.error("Erro ao buscar regras de disponibilidade:", dbError);
        // Não falha o request inteiro se o DB falhar
      }
    }

    return NextResponse.json({ 
      success: true, 
      busySlots,
      availabilityRules,
      timeMin,
      timeMax
    });
  } catch (error: any) {
    console.error("Erro na API do Google Calendar:", error);
    return NextResponse.json({ error: "Falha ao consultar disponibilidade" }, { status: 500 });
  }
}
