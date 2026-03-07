import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

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

        const { auction_id, team_id } = await req.json()

        // Parallelize all queries instead of sequential
        const [stateRes, auctionRes, teamRes] = await Promise.all([
            supabaseClient
                .from('auction_state')
                .select('current_bid,leading_team_id,current_player_id')
                .eq('auction_id', auction_id)
                .single(),
            supabaseClient
                .from('auctions')
                .select('settings')
                .eq('id', auction_id)
                .single(),
            supabaseClient
                .from('teams')
                .select('purse_remaining,slots_remaining')
                .eq('id', team_id)
                .single()
        ])

        const { data: state, error: stateError } = stateRes
        const { data: auction, error: auctionError } = auctionRes
        const { data: team, error: teamError } = teamRes

        if (stateError || !state || !state.current_player_id) {
            throw new Error('No active player for this auction')
        }
        if (auctionError) throw auctionError
        if (teamError) throw teamError

        const base_price = Number(auction.settings.base_price)
        const increment = Number(auction.settings.increment)

        // Calculate next bid
        const current_bid = state.current_bid ?? base_price
        const next_bid = state.leading_team_id === null ? current_bid : current_bid + increment

        // Validation checks
        if (team.purse_remaining < next_bid) {
            throw new Error('Insufficient purse')
        }

        if (team.slots_remaining <= 0) {
            throw new Error('No slots remaining')
        }

        const remaining_slots_after = team.slots_remaining - 1
        const required_money = remaining_slots_after * base_price

        if (team.purse_remaining - next_bid < required_money) {
            throw new Error('Minimum squad rule')
        }

        // Execute bid via RPC
        const { data: updatedState, error: rpcError } = await supabaseClient
            .rpc('execute_bid', {
                p_auction_id: auction_id,
                p_team_id: team_id,
                p_next_bid: next_bid
            })

        if (rpcError) throw rpcError

        return new Response(JSON.stringify(updatedState), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

