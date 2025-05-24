import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  console.log('=== API HANDLER START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    console.log('Method not allowed:', req.method);
    return new Response(
      JSON.stringify({
        error: `Method ${req.method} Not Allowed`,
        message: 'This endpoint only accepts POST requests',
        success: false,
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Allow': 'POST',
        },
      }
    );
  }

  try {
    // Parse JSON body
    const body = await req.json();
    console.log('Body:', body);

    const { prompt, message } = body;
    const userInput = prompt || message;

    if (!userInput || typeof userInput !== "string") {
      console.log('Invalid input:', userInput);
      return new Response(
        JSON.stringify({
          error: 'Missing or invalid prompt/message',
          message: 'Please provide a valid prompt or message',
          success: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Simple echo AI response
    const reply = `AI Response: ${userInput}`;

    console.log('Sending successful response:', reply);
    return new Response(
      JSON.stringify({
        result: reply,
        message: reply,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
