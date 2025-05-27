
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Set CORS headers for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method === "POST") {
    try {
      const { prompt } = await req.json();
      
      if (!prompt || typeof prompt !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid prompt provided' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Return the expected format: { "message": "Hello <prompt>!" }
      const message = `Hello ${prompt}!`;
      
      return new Response(
        JSON.stringify({ message }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to process request' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  return new Response("Method Not Allowed", { 
    status: 405,
    headers: corsHeaders
  });
});
