# hx-scope

An HTMX extension for selective input inclusion. Unlike traditional forms where **all inputs are always submitted**, this extension lets you scope inputs so they're **only included when you want them to be**.

## Why Use This?

In standard HTML forms and HTMX, all inputs within a form are included in every request. This becomes problematic when:

- You have multiple logical forms in one `<form>` element
- Different buttons should submit different sets of inputs
- You want to reuse the same input names for different purposes
- You need fine-grained control over which data gets sent

**hx-scope solves this** by letting you tag inputs with scopes and only including them when their scope matches the triggering element.

## Installation

### Via CDN

```html
<script src="https://unpkg.com/htmx.org@1.9.0"></script>
<script src="path/to/hx-scope.js"></script>
```

### Via npm

```bash
npm install hx-scope
```

Then include in your HTML:

```html
<script src="node_modules/htmx.org/dist/htmx.js"></script>
<script src="node_modules/hx-scope/hx-scope.js"></script>
```

## Try the Demo

An interactive demo is available in the `examples/` directory. To run it:

```bash
# Clone the repository
git clone https://github.com/ocomsoft/hx-scope.git
cd hx-scope/examples

# Start a local web server (choose one):
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000

# Then open http://localhost:8000/demo.html in your browser
```

The demo uses a Service Worker to intercept and display request details, so it must be served from a web server (opening the file directly won't work).

## Usage

### The Problem: Traditional Forms Submit Everything

```html
<!-- Traditional approach: ALL inputs are submitted with EVERY button click -->
<form>
  <input name="username" value="john">
  <input name="email" value="john@example.com">
  <input name="admin-note" value="note">

  <button hx-post="/user">Save User</button>  <!-- Sends ALL 3 inputs -->
  <button hx-post="/admin">Save Note</button> <!-- Also sends ALL 3 inputs -->
</form>
```

**Problem**: Both buttons send all three inputs, even though the user button doesn't need `admin-note` and the admin button doesn't need `username` or `email`.

### The Solution: CSS Selectors

```html
<div hx-ext="scoped-inputs">
  <input type="text" hx-name="username" class="user-form" value="john">
  <input type="text" hx-name="email" class="user-form" value="john@example.com">
  <input type="text" hx-name="admin-note" class="admin-form" value="note">

  <button hx-post="/user" hx-scope=".user-form">Save User</button>  <!-- Only sends username, email -->
  <button hx-post="/admin" hx-scope=".admin-form">Save Note</button> <!-- Only sends admin-note -->
</div>
```

**Solution**: Each button uses a CSS selector to specify which inputs to include. You have complete control using familiar CSS syntax.

### How It Works

1. **Enable the extension**: Add `hx-ext="scoped-inputs"` to a parent element
2. **Add CSS selector to trigger**: Add `hx-scope="<css-selector>"` to the element that triggers the HTMX request
3. **Name your inputs**: Use `hx-name="param-name"` on inputs you want to include
4. **Make inputs selectable**: Add classes, IDs, or attributes that match your selectors

### Key Attributes

- **`hx-scope`**: Applied to triggers (buttons, links, etc.)
  - Contains a CSS selector that matches the inputs to include
  - Examples: `.user-form`, `#section1 input`, `[data-form="user"]`, `.step-1, .step-2`
  - Any valid CSS selector works: classes, IDs, attributes, combinators, pseudo-selectors, etc.

- **`hx-name`**: Applied to inputs
  - Defines the parameter name for the input value
  - Similar to the standard `name` attribute
  - Only inputs with `hx-name` AND matching the CSS selector are included

### Selection Rules

The extension queries for elements matching the `hx-scope` selector, then includes only those with `hx-name`:

- If an element matches the selector AND has `hx-name`, it's included
- If an element doesn't match the selector, it's excluded (even with `hx-name`)
- If an element matches but lacks `hx-name`, it's ignored

### Advanced Example: CSS Selector Power

```html
<div hx-ext="scoped-inputs">
  <!-- Using comma-separated selectors to include multiple groups -->
  <button hx-post="/submit-all" hx-scope=".user-form, .profile-form">Submit All</button>

  <!-- Using descendant selectors -->
  <button hx-post="/submit-section" hx-scope="#user-section input[hx-name]">Submit Section</button>

  <!-- Using attribute selectors -->
  <button hx-post="/submit-step" hx-scope="[data-step='1']">Submit Step 1</button>

  <div id="user-section">
    <input type="text" hx-name="username" class="user-form" value="john">
    <input type="text" hx-name="email" class="user-form profile-form" value="john@example.com">
  </div>

  <input type="text" hx-name="bio" class="profile-form" value="Developer">
  <input type="text" hx-name="age" data-step="1" value="30">
</div>
```

### Example: Multiple Forms on One Page

```html
<div hx-ext="scoped-inputs">
  <h2>User Registration</h2>
  <input type="text" hx-name="username" class="registration">
  <input type="email" hx-name="email" class="registration">
  <button hx-post="/register" hx-scope=".registration">Register</button>

  <h2>Newsletter Signup</h2>
  <input type="email" hx-name="email" class="newsletter">
  <button hx-post="/newsletter" hx-scope=".newsletter">Subscribe</button>

  <h2>Global Analytics</h2>
  <input type="hidden" hx-name="page-id" class="analytics">
  <!-- Include analytics with both forms using multiple selectors -->
  <button hx-post="/register-with-tracking" hx-scope=".registration, .analytics">Register (tracked)</button>
</div>
```

**Key difference**: Without scoping, clicking "Register" would send **all inputs** (username, both emails, page-id). With hx-scope, you use CSS selectors to include exactly the inputs you want.

## Use Cases

### Only Send What You Need

Unlike traditional forms that submit **all** inputs regardless of which button is clicked, hx-scope gives you precise control using CSS selectors:

- **Multiple logical forms in one container**: Use classes like `.user-form` and `.admin-form` to distinguish different form groups in the same area
- **Conditional data submission**: Different buttons use different selectors to send completely different sets of inputs, even if they're intermingled
- **Prevent data leakage**: Ensure sensitive inputs are only sent when explicitly selected, not accidentally included in every request
- **Structural selection**: Use selectors like `#section1 input` to include all inputs within a specific container
- **Attribute-based grouping**: Use `[data-step="1"]` to group inputs by custom attributes
- **Wizard-style forms**: Use `.step-1`, `.step-2` classes and submit only the current step
- **Complex selection logic**: Combine selectors with commas (`.form1, .form2`), use `:not()` to exclude elements, or any other CSS selector feature
- **No naming conflicts**: The same input can match multiple selectors by having multiple classes

## Browser Support

Works with all browsers supported by HTMX (IE11+, modern browsers).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
