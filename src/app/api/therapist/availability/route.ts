import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET: buscar regras de disponibilidade de um terapeuta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const therapistId = searchParams.get("therapist_id");

  if (!therapistId) {
    return NextResponse.json({ error: "therapist_id é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("therapist_availability")
    .select("*")
    .eq("therapist_id", therapistId)
    .order("day_of_week", { ascending: true });

  if (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, rules: data });
}

// POST: criar ou atualizar regra de disponibilidade (upsert)
export async function POST(request: Request) {
  const supabase = await createClient();

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { therapist_id, rule_type, day_of_week, specific_date, time_slots, is_blocked } = body;

  if (!therapist_id || !rule_type) {
    return NextResponse.json({ error: "therapist_id e rule_type são obrigatórios" }, { status: 400 });
  }

  // Verificar se o usuário logado é o terapeuta em questão
  const { data: therapist } = await supabase
    .from("therapists")
    .select("id")
    .eq("id", therapist_id)
    .eq("email", user.email)
    .single();

  if (!therapist) {
    return NextResponse.json({ error: "Acesso negado: você não é este terapeuta" }, { status: 403 });
  }

  if (rule_type === "weekly") {
    if (day_of_week === undefined || day_of_week === null) {
      return NextResponse.json({ error: "day_of_week é obrigatório para regras semanais" }, { status: 400 });
    }

    // Buscar regra existente para este dia da semana
    const { data: existing } = await supabase
      .from("therapist_availability")
      .select("id")
      .eq("therapist_id", therapist_id)
      .eq("rule_type", "weekly")
      .eq("day_of_week", day_of_week)
      .maybeSingle();

    const payload = {
      therapist_id,
      rule_type: "weekly" as const,
      day_of_week,
      specific_date: null,
      time_slots: time_slots || [],
      is_blocked: is_blocked || false,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      ({ data, error } = await supabase
        .from("therapist_availability")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from("therapist_availability")
        .insert(payload)
        .select()
        .single());
    }

    if (error) {
      console.error("Erro ao salvar regra semanal:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: data });

  } else if (rule_type === "date_override") {
    if (!specific_date) {
      return NextResponse.json({ error: "specific_date é obrigatório para overrides" }, { status: 400 });
    }

    // Buscar override existente para esta data
    const { data: existing } = await supabase
      .from("therapist_availability")
      .select("id")
      .eq("therapist_id", therapist_id)
      .eq("rule_type", "date_override")
      .eq("specific_date", specific_date)
      .maybeSingle();

    const payload = {
      therapist_id,
      rule_type: "date_override" as const,
      day_of_week: null,
      specific_date,
      time_slots: time_slots || [],
      is_blocked: is_blocked || false,
      updated_at: new Date().toISOString(),
    };

    let data, error;
    if (existing) {
      ({ data, error } = await supabase
        .from("therapist_availability")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from("therapist_availability")
        .insert(payload)
        .select()
        .single());
    }

    if (error) {
      console.error("Erro ao salvar override:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, rule: data });

  } else {
    return NextResponse.json({ error: "rule_type inválido" }, { status: 400 });
  }
}

// DELETE: remover regra de disponibilidade
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ruleId = searchParams.get("id");

  if (!ruleId) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  // Verificar ownership: a regra pertence ao terapeuta logado?
  const { data: rule } = await supabase
    .from("therapist_availability")
    .select("therapist_id")
    .eq("id", ruleId)
    .single();

  if (rule) {
    const { data: therapist } = await supabase
      .from("therapists")
      .select("id")
      .eq("id", rule.therapist_id)
      .eq("email", user.email)
      .single();

    if (!therapist) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from("therapist_availability")
    .delete()
    .eq("id", ruleId);

  if (error) {
    console.error("Erro ao deletar regra:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
