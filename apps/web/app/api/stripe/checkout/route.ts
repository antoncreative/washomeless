import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { personId } = await request.json()
  if (!personId) {
    return NextResponse.json({ error: 'personId required' }, { status: 400 })
  }

  // Fetch person and check supporter limit
  const { data: person, error: personError } = await supabase
    .from('sponsored_people')
    .select('id, name, current_supporters, max_supporters, status')
    .eq('id', personId)
    .eq('status', 'active')
    .single()

  if (personError || !person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 })
  }

  if (person.current_supporters >= person.max_supporters) {
    return NextResponse.json({ error: 'This person is fully supported' }, { status: 409 })
  }

  // Check if user already has active subscription for this person
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('person_id', personId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'You are already supporting this person' }, { status: 409 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Support ${person.name} — Washomeless`,
            description: 'Monthly contribution to fund housing, therapy, and job training.',
          },
          unit_amount: 3000, // $30.00 in cents
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    metadata: {
      person_id: personId,
      user_id: user.id,
    },
    subscription_data: {
      metadata: {
        person_id: personId,
        user_id: user.id,
      },
    },
    customer_email: user.email,
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/people/${personId}`,
  })

  return NextResponse.json({ url: session.url })
}
