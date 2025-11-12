/**
 * hx-scope - HTMX Extension for Scoped Input Parameters
 *
 * This extension allows you to control which form inputs are included in HTMX requests
 * by using scopes. This is useful when you have multiple forms or input groups on a page
 * and want to selectively include inputs based on scope matching.
 *
 * Usage:
 *   <button hx-post="/submit" hx-scope="user-form">Submit User</button>
 *   <input type="text" hx-name="username" hx-scope="user-form" value="john">
 *   <input type="text" hx-name="email" hx-scope="user-form" value="john@example.com">
 *   <input type="text" hx-name="admin-note" hx-scope="admin-form" value="note">
 *
 * When the button is clicked, only inputs with matching scope (user-form) will be included.
 * Inputs without hx-scope attribute are always included.
 *
 * @license MIT
 */

(function() {
  htmx.defineExtension('scoped-inputs', {
    onEvent: function(name, evt) {
      if (name === 'htmx:configRequest') {
        const target = evt.detail.target;
        const targetScopes = target.getAttribute('hx-scope');

        // Only run if target has hx-scope attribute
        if (targetScopes === null) return;

        // Search within the closest form, or target's parent element
        const searchRoot = target.closest('form') || target.parentElement;
        if (!searchRoot) return;

        // Find all inputs/selects with hx-name in that area
        const inputs = searchRoot.querySelectorAll(`input[hx-name], select[hx-name], textarea[hx-name]`);

        inputs.forEach(input => {
          const paramName = input.getAttribute('hx-name');
          const inputScopes = input.getAttribute('hx-scope');

          let shouldInclude = false;

          if (!inputScopes) {
            // Input has no scope - always include it
            shouldInclude = true;
          } else if (targetScopes) {
            // Both have scopes - check if they match
            const targetScopeList = targetScopes.split(/\s+/);
            const inputScopeList = inputScopes.split(/\s+/);
            shouldInclude = targetScopeList.some(scope => inputScopeList.includes(scope));
          }

          if (shouldInclude) {
            evt.detail.parameters[paramName] = input.value;
          }
        });
      }
    }
  });
})();
