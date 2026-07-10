import { NextResponse } from "next/server";

// POST /api/stripe/webhook — STUB Stripe-ready (D8). Non exercé en perso (PERSONAL_MODE).
// Sans STRIPE_WEBHOOK_SECRET → 501. Aucune dépendance `stripe` importée.
//
// EXT-02 (multi-tenant) : brancher ici la vérif de signature Stripe
// (stripe.webhooks.constructEvent) puis flip users.paid sur checkout.session.completed
// / customer.subscription.deleted, via le client service-role (server-only).
export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ stripe: "not_configured" }, { status: 501 });
  }
  // Secret présent mais handler live pas encore implémenté (perso n'exerce jamais ce chemin).
  return NextResponse.json({ stripe: "not_implemented" }, { status: 501 });
}
