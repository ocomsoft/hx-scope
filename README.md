# hx-scope

An HTMX extension for scoped input parameters. Control which form inputs are included in HTMX requests using scope matching.

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

### Basic Example

```html
<div hx-ext="scoped-inputs">
  <button hx-post="/submit" hx-scope="user-form">Submit User</button>

  <input type="text" hx-name="username" hx-scope="user-form" value="john">
  <input type="text" hx-name="email" hx-scope="user-form" value="john@example.com">
  <input type="text" hx-name="admin-note" hx-scope="admin-form" value="note">
</div>
```

When the button is clicked, only inputs with matching scope (`user-form`) will be included in the request. The `admin-note` input will be excluded because its scope doesn't match.

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

## Use Cases

- **Multiple forms on one page**: Prevent input collisions when multiple forms exist
- **Conditional input inclusion**: Include different sets of inputs based on which action is triggered
- **Complex form interactions**: Build sophisticated UIs with selective data submission
- **Wizard-style forms**: Submit only relevant steps in multi-step forms

## Browser Support

Works with all browsers supported by HTMX (IE11+, modern browsers).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
