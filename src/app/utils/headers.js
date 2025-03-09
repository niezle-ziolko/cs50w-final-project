export function bearerHeaders(request, authToken) {
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith(`Bearer ${authToken}`)) {
    return new Response(JSON.stringify({ operation: false, error: 'No authorization.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return null;
};

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  };
};