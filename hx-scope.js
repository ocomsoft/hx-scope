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
 * Bonus feature - hx-off-value for checkboxes:
 *   <input type="checkbox" hx-name="subscribe" hx-off-value="0" value="1">
 *   When checked: sends subscribe=1, when unchecked: sends subscribe=0
 *
 * @license MIT
 */

(function() {
  htmx.defineExtension('scoped-inputs', {
    onEvent: function(name, evt) {
      if (name === 'htmx:configRequest') {
        // evt.detail.elt is the element that triggered the request (has hx-post, hx-scope, etc.)
        // evt.detail.target is the swap target (where response goes)
        const triggeringElement = evt.detail.elt;
        const scopeSelector = triggeringElement.getAttribute('hx-scope');

        // Only run if triggering element has hx-scope attribute
        if (!scopeSelector) return;

        // Search within the closest form, or triggering element's parent, or document
        const searchRoot = triggeringElement.closest('form') || triggeringElement.parentElement || document;

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
                if (element.checked) {
                  value = element.value || 'on';
                } else {
                  // Use hx-off-value if specified, otherwise empty string
                  value = element.getAttribute('hx-off-value') || '';
                }
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
