/**
 * hx-scope - HTMX Extension for Selective Input Inclusion
 *
 * This extension allows you to control which form inputs are included in HTMX requests
 * using CSS selectors. Unlike traditional forms where all inputs are submitted, this lets
 * you scope inputs so they're only included when you want them to be.
 *
 * Usage:
 *   <button hx-post="/submit" hx-scope=".user-form">Submit User</button>
 *   <input type="text" hx-name="username" class="user-form" value="john">
 *   <input type="text" hx-name="email" class="user-form" value="john@example.com">
 *   <input type="text" hx-name="admin-note" class="admin-form" value="note">
 *
 * When the button is clicked, only inputs matching the CSS selector will be included.
 * You can use any valid CSS selector: classes, IDs, attributes, combinators, etc.
 *
 * @license MIT
 */

(function() {
  htmx.defineExtension('scoped-inputs', {
    onEvent: function(name, evt) {
      if (name === 'htmx:configRequest') {
        const target = evt.detail.target;
        const scopeSelector = target.getAttribute('hx-scope');

        // Only run if target has hx-scope attribute
        if (!scopeSelector) return;

        // Search within the closest form, or target's parent element, or document
        const searchRoot = target.closest('form') || target.parentElement || document;

        try {
          // Use the hx-scope value as a CSS selector
          const matchedElements = searchRoot.querySelectorAll(scopeSelector);

          matchedElements.forEach(element => {
            // Only include elements that have hx-name attribute
            const paramName = element.getAttribute('hx-name');
            if (paramName) {
              // Get the value based on element type
              let value = '';
              if (element.type === 'checkbox') {
                value = element.checked ? (element.value || 'on') : '';
              } else if (element.type === 'radio') {
                value = element.checked ? element.value : '';
              } else {
                value = element.value;
              }

              // Only add if there's a value (for checkboxes/radios) or always for other inputs
              if (element.type === 'checkbox' || element.type === 'radio') {
                if (value) {
                  evt.detail.parameters[paramName] = value;
                }
              } else {
                evt.detail.parameters[paramName] = value;
              }
            }
          });
        } catch (error) {
          console.error('hx-scope: Invalid CSS selector:', scopeSelector, error);
        }
      }
    }
  });
})();
