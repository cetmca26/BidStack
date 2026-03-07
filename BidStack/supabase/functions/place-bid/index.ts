import { serve } from "std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        console.log("AUTH HEADER:", authHeader?.slice(0,30));
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Missing Authorization" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            {
                global: {
                    headers: { Authorization: authHeader },
                },
                auth: {
                    persistSession: false,
                },
            }
        );
        
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error("Unauthorized");

        // 1. Log the raw body for debugging (clone the request to avoid consuming it)
        const rawBody = await req.clone().text();
        console.log("Raw body:", rawBody);

        // 2. Parse request body
        let body;
        try {
            body = await req.json();
        } catch {
            throw new Error("Invalid JSON body");
        }

        const { auction_id, team_id, bid_amount } = body ?? {};

        console.log("Incoming bid request:", { auction_id, team_id, bid_amount });

        if (!auction_id || !team_id || bid_amount === undefined) {
            throw new Error('Missing required fields: auction_id, team_id, bid_amount');
        }

        // 3. Execute bid via consolidated RPC
        const { data: updatedState, error: rpcError } = await supabaseClient
            .rpc('execute_bid', {
                p_auction_id: auction_id,
                p_team_id: team_id,
                p_next_bid: bid_amount
            });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            throw new Error(rpcError.message);
        }

        return new Response(JSON.stringify(updatedState), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error("Edge function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});

