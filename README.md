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

### The Solution: Scoped Inputs

```html
<div hx-ext="scoped-inputs">
  <input type="text" hx-name="username" hx-scope="user-form" value="john">
  <input type="text" hx-name="email" hx-scope="user-form" value="john@example.com">
  <input type="text" hx-name="admin-note" hx-scope="admin-form" value="note">

  <button hx-post="/user" hx-scope="user-form">Save User</button>  <!-- Only sends username, email -->
  <button hx-post="/admin" hx-scope="admin-form">Save Note</button> <!-- Only sends admin-note -->
</div>
```

**Solution**: Each button only sends inputs with matching scopes. You have complete control over which inputs are included in each request.

### How It Works

1. **Enable the extension**: Add `hx-ext="scoped-inputs"` to a parent element
2. **Mark the trigger**: Add `hx-scope="scope-name"` to the element that triggers the HTMX request (button, link, etc.)
3. **Name your inputs**: Use `hx-name="param-name"` instead of `name` attribute
4. **Optionally scope inputs**: Add `hx-scope="scope-name"` to inputs to restrict them to specific scopes

### Key Attributes

- **`hx-scope`**: Applied to both triggers and inputs
  - On triggers: Defines which scope(s) this request belongs to
  - On inputs: Defines which scope(s) this input belongs to
  - Supports multiple scopes: `hx-scope="form1 form2"`

- **`hx-name`**: Applied to inputs only
  - Defines the parameter name for the input value
  - Similar to the standard `name` attribute, but scope-aware

### Scope Matching Rules

1. **Input without `hx-scope`**: Always included in the request
2. **Input with `hx-scope`**: Only included if at least one scope matches the trigger's scope
3. **Multiple scopes**: Both triggers and inputs can have multiple space-separated scopes

### Advanced Example: Multiple Scopes

```html
<div hx-ext="scoped-inputs">
  <!-- This button includes inputs from both user-form AND profile-form scopes -->
  <button hx-post="/submit-all" hx-scope="user-form profile-form">Submit All</button>

  <!-- This input matches user-form -->
  <input type="text" hx-name="username" hx-scope="user-form" value="john">

  <!-- This input matches profile-form -->
  <input type="text" hx-name="bio" hx-scope="profile-form" value="Developer">

  <!-- This input matches both scopes -->
  <input type="text" hx-name="email" hx-scope="user-form profile-form" value="john@example.com">

  <!-- This input is always included (no scope) -->
  <input type="hidden" hx-name="timestamp" value="2025-11-12">
</div>
```

### Example: Multiple Forms on One Page

```html
<div hx-ext="scoped-inputs">
  <h2>User Registration</h2>
  <input type="text" hx-name="username" hx-scope="registration">
  <input type="email" hx-name="email" hx-scope="registration">
  <button hx-post="/register" hx-scope="registration">Register</button>

  <h2>Newsletter Signup</h2>
  <input type="email" hx-name="email" hx-scope="newsletter">
  <button hx-post="/newsletter" hx-scope="newsletter">Subscribe</button>

  <h2>Analytics (sent with all requests)</h2>
  <input type="hidden" hx-name="page-id" value="home">
</div>
```

**Key difference**: Without scoping, clicking "Register" would send **all inputs** (username, both emails, and page-id). With hx-scope, it only sends inputs with matching scopes (username, registration email, and page-id).

## Use Cases

### Only Send What You Need

Unlike traditional forms that submit **all** inputs regardless of which button is clicked, hx-scope gives you precise control:

- **Multiple logical forms in one container**: Have user settings, admin controls, and analytics inputs all in the same DOM area, but only submit the relevant ones for each action
- **Conditional data submission**: Different buttons can send completely different sets of inputs, even if they're intermingled in the HTML
- **Prevent data leakage**: Ensure sensitive inputs are only sent when explicitly needed, not accidentally included in every request
- **Reuse input names**: Have multiple `email` or `name` inputs for different purposes, distinguished by scope rather than unique names
- **Wizard-style forms**: Submit only the current step's inputs, not the entire form
- **Dynamic forms**: Add/remove inputs from scopes dynamically based on user interaction

## Browser Support

Works with all browsers supported by HTMX (IE11+, modern browsers).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
