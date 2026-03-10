import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import type { Database } from '@/types/database'

// Use service role client for webhook — bypasses RLS
function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const personId = session.metadata?.person_id
        const userId = session.metadata?.user_id
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        if (!personId || !userId) break

        // Create subscription record
        await supabase.from('subscriptions').insert({
          user_id: userId,
          person_id: personId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          amount: 3000,
          status: 'active',
        })

        // Increment current_supporters
        const { data: person } = await supabase
          .from('sponsored_people')
          .select('current_supporters')
          .eq('id', personId)
          .single()

        if (person) {
          await supabase
            .from('sponsored_people')
            .update({
              current_supporters: person.current_supporters + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', personId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          (invoice.parent?.subscription_details?.subscription as string | undefined) ?? null
        if (!subscriptionId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          (invoice.parent?.subscription_details?.subscription as string | undefined) ?? null
        if (!subscriptionId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        // Find the subscription record to get person_id
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('person_id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        // Update status
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subscriptionId)

        // Decrement current_supporters
        if (sub?.person_id) {
          const { data: person } = await supabase
            .from('sponsored_people')
            .select('current_supporters')
            .eq('id', sub.person_id)
            .single()

          if (person && person.current_supporters > 0) {
            await supabase
              .from('sponsored_people')
              .update({
                current_supporters: person.current_supporters - 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', sub.person_id)
          }
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
