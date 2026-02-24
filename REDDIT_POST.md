# Reddit Post: Announcing hx-scope

---

## Title

**I built an HTMX extension for component isolation within forms - reuse input names without conflicts! 🎯**

---

## Post Body

Hey r/htmx! I just released **hx-scope**, an HTMX extension that solves a problem I kept running into: **how do you handle multiple instances of the same component within a single form?**

### The Problem

Imagine you're building a shopping cart with multiple line items. Each line item has quantity and price inputs, and you want to calculate the line total before final checkout:

```html
<form hx-post="/checkout">
  <!-- Line Item 1 -->
  <input name="quantity" value="2">
  <input name="price" value="10.00">
  <button hx-post="/calculate">Calculate</button>

  <!-- Line Item 2 -->
  <input name="quantity" value="1">  <!-- ❌ Name conflict! -->
  <input name="price" value="15.00">  <!-- ❌ Name conflict! -->
  <button hx-post="/calculate">Calculate</button>

  <button type="submit">Checkout</button>
</form>
```

**Problems:**
1. ❌ You can't reuse input names (`quantity`, `price`) - they conflict
2. ❌ When you click "Calculate" on one line, HTMX sends ALL inputs from the form
3. ❌ The intermediate calculation values get submitted with the final checkout

### The Solution: hx-name vs name

**hx-scope** introduces a key concept: inputs with `hx-name` are **excluded** from parent form submission and **only** included when explicitly selected via `hx-scope` selectors.

```html
<form hx-ext="scoped-inputs" hx-post="/checkout">
  <!-- Line Item 1 -->
  <div>
    <input hx-name="quantity" class="item-1" value="2">
    <input hx-name="price" class="item-1" value="10.00">
    <button hx-post="/calculate" hx-scope=".item-1">Calculate</button>
    <input type="hidden" name="line_total_1" value="20.00">
  </div>

  <!-- Line Item 2 - Same input names, no conflicts! -->
  <div>
    <input hx-name="quantity" class="item-2" value="1">
    <input hx-name="price" class="item-2" value="15.00">
    <button hx-post="/calculate" hx-scope=".item-2">Calculate</button>
    <input type="hidden" name="line_total_2" value="15.00">
  </div>

  <button type="submit">Checkout</button>
</form>
```

**What happens:**

🔵 **Click "Calculate" on Line 1:**
- Sends to `/calculate`: `quantity=2&price=10.00` (only from `.item-1`)
- Server calculates total and updates `line_total_1`

🔵 **Click "Calculate" on Line 2:**
- Sends to `/calculate`: `quantity=1&price=15.00` (only from `.item-2`)
- Server calculates total and updates `line_total_2`

🟢 **Click "Checkout":**
- Sends to `/checkout`: `line_total_1=20.00&line_total_2=15.00`
- **Does NOT send** the intermediate `quantity` and `price` values!

### Why This is Powerful

✅ **Reusable component logic** - Use the same input names in multiple components
✅ **No naming conflicts** - `quantity` and `price` can appear multiple times
✅ **Clean form submission** - Only final values are submitted, not intermediate inputs
✅ **Component isolation** - Each component's scope is independent
✅ **Uses CSS selectors** - Flexible selection with `.class`, `#id`, `[data-attr]`, etc.

### Bonus Feature: hx-off-value for Checkboxes

Ever wanted unchecked checkboxes to send an explicit `false` or `0` instead of nothing?

```html
<input type="checkbox" hx-name="notifications"
       hx-off-value="0" value="1">
```

- Checked → sends `notifications=1`
- Unchecked → sends `notifications=0` (instead of nothing!)

### Visual Diagram

Here's what gets sent with each button click:

```
Form contains:
┌─────────────────────────────────────┐
│ Line Item 1 (class='item-1')        │
│ ├─ hx-name: quantity=2              │
│ ├─ hx-name: price=10.00             │
│ └─ name: line_total_1=20.00         │
│                                     │
│ Line Item 2 (class='item-2')        │
│ ├─ hx-name: quantity=1              │
│ ├─ hx-name: price=15.00             │
│ └─ name: line_total_2=15.00         │
└─────────────────────────────────────┘

🔵 Calculate Button 1 (hx-scope='.item-1')
   POST /calculate → quantity=2&price=10.00

🔵 Calculate Button 2 (hx-scope='.item-2')
   POST /calculate → quantity=1&price=15.00

🟢 Checkout Button (no hx-scope)
   POST /checkout → line_total_1=20.00&line_total_2=15.00
```

### Try the Live Demos

I built 5 interactive demos using Service Workers so you can see exactly what data gets sent:

1. **Basic CSS Class Selectors** - Two forms on one page
2. **Multiple Selectors** - Comma-separated selectors
3. **Attribute Selectors** - Advanced CSS selection
4. **Checkbox hx-off-value** - Explicit false values
5. **Component Isolation** - The shopping cart example (⭐ killer feature!)

**Demo link:** [https://github.com/ocomsoft/hx-scope/tree/main/examples](https://github.com/ocomsoft/hx-scope/tree/main/examples)

Just clone the repo, run `python -m http.server 8000` in the `examples/` folder, and open `http://localhost:8000/`

### Installation

```html
<!-- Via CDN -->
<script src="https://unpkg.com/htmx.org@1.9.10"></script>
<script src="path/to/hx-scope.js"></script>

<!-- Then add hx-ext="scoped-inputs" to your element -->
<form hx-ext="scoped-inputs">
  <!-- Your scoped inputs here -->
</form>
```

### GitHub Repo

⭐ **https://github.com/ocomsoft/hx-scope**

MIT Licensed. PRs and feedback welcome!

---

**TL;DR:** Built an HTMX extension that lets you use `hx-name` instead of `name` on inputs to exclude them from parent form submission. Only include them when you want via CSS selectors (`hx-scope`). Perfect for component isolation and reusable input names within forms.

---

### Discussion Questions for the Community

1. Have you run into this problem before? How did you solve it?
2. Are there other use cases for this pattern that I'm missing?
3. Would you find this useful in your projects?

Looking forward to your feedback! 🚀
