/**
 * Service Worker for hx-scope demo
 * Intercepts API requests and returns formatted request details
 */

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    // Take control of all clients immediately
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept /calculate endpoint for line item calculations
    if (url.pathname === '/calculate') {
        event.respondWith(handleCalculateRequest(event.request));
    }
    // Intercept requests to /api/*
    else if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(event.request));
    }
});

async function handleCalculateRequest(request) {
    const url = new URL(request.url);

    // Parse query parameters (for item_id and product_id)
    let params = {};
    for (const [key, value] of url.searchParams) {
        params[key] = value;
    }

    // Parse the request body to get quantity and price
    if (request.method === 'POST') {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const bodyParams = await request.json();
            params = { ...params, ...bodyParams };
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            for (const [key, value] of formData) {
                params[key] = value;
            }
        }
    }

    // Extract quantity, price, and item info
    const quantity = parseFloat(params.quantity) || 0;
    const price = parseFloat(params.price) || 0;
    const itemId = params.item_id || '1';
    const productId = params.product_id || 'unknown';
    const productName = params.product_name || 'Product';

    const total = quantity * price;

    // Return the complete result div with ID that will replace the target via outerHTML
    // This includes both the display div and the hidden inputs with updated values
    const html = `<div id="line-${itemId}-result">
    <div style="margin-top: 10px; font-size: 16px; font-weight: 500; color: #059669;">
        Line Total: $${total.toFixed(2)}
    </div>
    <input type="hidden" name="line_total_${itemId}" id="line_total_${itemId}" value="${total.toFixed(2)}">
    <input type="hidden" name="product_id_${itemId}" value="${productId}">
</div>`;

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'X-Demo-Response': 'true'
        }
    });
}

async function handleApiRequest(request) {
    const url = new URL(request.url);
    const method = request.method;

    // Parse the request body if present
    let params = {};
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            params = await request.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            for (const [key, value] of formData) {
                params[key] = value;
            }
        }
    }

    // Get query parameters
    const queryParams = {};
    for (const [key, value] of url.searchParams) {
        queryParams[key] = value;
    }

    // Build response HTML
    const html = `
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 4px; margin-top: 10px;">
            <div style="margin-bottom: 10px;">
                <strong style="color: #15803d;">✓ Request Intercepted</strong>
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Endpoint:</strong> <code style="background: #1f2937; color: #e5e7eb; padding: 2px 6px; border-radius: 3px;">${method} ${url.pathname}</code>
            </div>
            ${Object.keys(params).length > 0 ? `
            <div style="margin-bottom: 8px;">
                <strong>Parameters sent:</strong>
            </div>
            <pre style="background: #1f2937; color: #e5e7eb; padding: 10px; border-radius: 4px; overflow-x: auto; margin: 5px 0;">${JSON.stringify(params, null, 2)}</pre>
            ` : '<div style="color: #666; font-style: italic;">No parameters sent</div>'}
            ${Object.keys(queryParams).length > 0 ? `
            <div style="margin-top: 8px;">
                <strong>Query parameters:</strong>
                <pre style="background: #1f2937; color: #e5e7eb; padding: 10px; border-radius: 4px; overflow-x: auto; margin: 5px 0;">${JSON.stringify(queryParams, null, 2)}</pre>
            </div>
            ` : ''}
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #22c55e; color: #666; font-size: 12px;">
                Request timestamp: ${new Date().toISOString()}
            </div>
        </div>
    `;

    return new Response(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'X-Demo-Response': 'true'
        }
    });
}
