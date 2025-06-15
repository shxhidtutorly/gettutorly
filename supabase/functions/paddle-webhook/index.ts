
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { event_type, data } = body

    console.log('Paddle webhook received:', event_type, data?.id)

    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(supabaseClient, data)
        break
      
      case 'subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, data)
        break
      
      case 'transaction.completed':
        await handleTransactionCompleted(supabaseClient, data)
        break
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(supabaseClient, data)
        break
      
      default:
        console.log('Unhandled webhook event:', event_type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function handleSubscriptionCreated(supabase: any, data: any) {
  try {
    const customData = data.custom_data || {}
    const userId = customData.user_id
    const planName = customData.planName || 'Unknown Plan'

    if (!userId) {
      console.error('No user_id found in subscription data')
      return
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        paddle_subscription_id: data.id,
        paddle_customer_id: data.customer_id,
        plan_name: planName,
        status: 'active',
        subscription_start_date: data.current_billing_period?.starts_at,
        subscription_end_date: data.current_billing_period?.ends_at,
        current_period_start: data.current_billing_period?.starts_at,
        current_period_end: data.current_billing_period?.ends_at,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error creating subscription:', error)
    } else {
      console.log('Subscription created for user:', userId)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: data.status,
        current_period_start: data.current_billing_period?.starts_at,
        current_period_end: data.current_billing_period?.ends_at,
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id)

    if (error) {
      console.error('Error updating subscription:', error)
    } else {
      console.log('Subscription updated:', data.id)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleTransactionCompleted(supabase: any, data: any) {
  console.log('Transaction completed:', data.id)
  // Handle one-time payments if needed
}

async function handleSubscriptionCanceled(supabase: any, data: any) {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('paddle_subscription_id', data.id)

    if (error) {
      console.error('Error canceling subscription:', error)
    } else {
      console.log('Subscription canceled:', data.id)
    }
  } catch (error) {
    console.error('Error handling subscription canceled:', error)
  }
}
