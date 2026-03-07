import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Deno's serve provides a Request object
serve(async (req: Request) =>  {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { auction_id, team_id, bid_amount } = await req.json()

        // Validate required parameters
        if (!auction_id || !team_id || bid_amount === undefined) {
            throw new Error('Missing required parameters: auction_id, team_id, bid_amount')
        }

        // Parallelize all queries instead of sequential
        const [stateRes, auctionRes, teamRes] = await Promise.all([
            supabaseClient
                .from('auction_state')
                .select('current_bid,leading_team_id,current_player_id,status')
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

        if (stateError || !state) {
            throw new Error('Failed to fetch auction state')
        }
        if (!state.current_player_id) {
            throw new Error('No active player for this auction')
        }
        if (auctionError || !auction) {
            throw new Error('Failed to fetch auction settings')
        }
        if (teamError || !team) {
            throw new Error('Failed to fetch team data')
        }

        // Validate auction is live
        if (state.status !== 'live') {
            throw new Error('Auction is not in live status')
        }

        // Validation: Team is not already leading the bid
        if (state.leading_team_id === team_id) {
            throw new Error('Team is already leading the bid')
        }

        const base_price = Number(auction.settings.base_price)
        const increment = Number(auction.settings.increment)
        const current_bid = state.current_bid

        // If no bids yet, first bid must be >= base_price
        if (state.leading_team_id === null) {
            if (bid_amount < base_price) {
                throw new Error(`First bid must be at least base price (${base_price})`)
            }
            if ((bid_amount - base_price) % increment !== 0) {
                throw new Error(`Initial bid must be in increments of ${increment} above base price`)
            }
        } else {
            // Subsequent bids must be higher than currently leading bid
            if (bid_amount <= (current_bid ?? 0)) {
                throw new Error(`Bid amount must be higher than current bid (${current_bid})`)
            }
            if ((bid_amount - (current_bid ?? 0)) % increment !== 0) {
                throw new Error(`Bid must be in increments of ${increment}`)
            }
        }

        // Validation: Check purse remaining
        if (team.purse_remaining < bid_amount) {
            throw new Error('Insufficient purse remaining')
        }

        if (team.slots_remaining <= 0) {
            throw new Error('No slots remaining')
        }

        const remaining_slots_after = team.slots_remaining - 1
        const required_money = remaining_slots_after * base_price

        if (team.purse_remaining - bid_amount < required_money) {
            throw new Error('Insufficient funds to maintain minimum squad requirement')
        }

        // Execute bid via RPC
        const { data: updatedState, error: rpcError } = await supabaseClient
            .rpc('execute_bid', {
                p_auction_id: auction_id,
                p_team_id: team_id,
                p_next_bid: bid_amount
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

