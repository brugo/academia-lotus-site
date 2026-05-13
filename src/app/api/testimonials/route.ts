import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Admin client with service_role key (bypasses RLS)
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

// GET: Fetch approved testimonials (public) or all testimonials (admin)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adminView = searchParams.get("admin") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (adminView) {
    // Check if user is authenticated (admin access is protected by AdminGuard in the UI)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Use admin client to bypass RLS and see all testimonials
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar depoimentos (admin):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ testimonials: data });
  }

  // Public: Only approved testimonials (uses anon key, RLS handles filtering)
  const targetPage = searchParams.get("page");
  
  const supabase = await createClient();
  let query = supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (targetPage) {
    query = query.eq("target_page", targetPage);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar depoimentos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ testimonials: data });
}

// POST: Submit a new testimonial (authenticated users only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Você precisa estar logado para enviar um depoimento." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, admin_create, admin_name, admin_avatar_url, admin_date, badge_text, target_page } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: "O título deve ter no máximo 100 caracteres." }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "O depoimento deve ter no máximo 500 caracteres." }, { status: 400 });
    }

    // ADMIN CREATE: Manual testimonial with custom data, auto-approved
    if (admin_create) {
      if (!admin_name?.trim()) {
        return NextResponse.json({ error: "O nome do cliente é obrigatório." }, { status: 400 });
      }

      const adminClient = createAdminClient();
      const createdAt = admin_date ? new Date(admin_date).toISOString() : new Date().toISOString();

      const { data, error } = await adminClient
        .from("testimonials")
        .insert([{
          user_id: user.id, // admin's own ID as creator
          user_name: admin_name.trim(),
          user_avatar_url: admin_avatar_url || null,
          title: title.trim(),
          content: content.trim(),
          status: "approved",
          created_at: createdAt,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          badge_text: badge_text || null,
          target_page: target_page || "home",
        }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar depoimento manual:", error);
        return NextResponse.json({ error: "Erro ao criar depoimento." }, { status: 500 });
      }

      return NextResponse.json({ testimonial: data, message: "Depoimento criado e publicado com sucesso!" });
    }

    // NORMAL USER: Check for existing pending testimonial
    const { data: existing } = await supabase
      .from("testimonials")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Você já possui um depoimento aguardando aprovação." }, { status: 409 });
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    const { data, error } = await supabase
      .from("testimonials")
      .insert([{
        user_id: user.id,
        user_name: userName,
        user_avatar_url: avatarUrl,
        title: title.trim(),
        content: content.trim(),
        status: "pending",
        target_page: target_page || "home",
      }])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar depoimento:", error);
      return NextResponse.json({ error: "Erro ao salvar depoimento." }, { status: 500 });
    }

    return NextResponse.json({ testimonial: data, message: "Depoimento enviado com sucesso! Aguarde aprovação." });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}

// PATCH: Update testimonial status (admin only)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status, badge_text, title, content, user_name, user_avatar_url, created_at, target_page } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    const updateData: Record<string, unknown> = {};

    if (status) {
      if (!["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Status inválido." }, { status: 400 });
      }
      updateData.status = status;
      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user.id;
      }
    }

    if (badge_text !== undefined) updateData.badge_text = badge_text || null;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (user_name !== undefined) updateData.user_name = user_name;
    if (user_avatar_url !== undefined) updateData.user_avatar_url = user_avatar_url || null;
    if (created_at !== undefined) updateData.created_at = created_at;
    if (target_page !== undefined) updateData.target_page = target_page || "home";

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error } = await adminClient
      .from("testimonials")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar depoimento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
}

// DELETE: Delete a testimonial (admin only)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar depoimento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar." }, { status: 400 });
  }
}
