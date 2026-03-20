Simple leaf widgets (quick wins)

UICheckbox — toggle [X] / [ ] with label. Supports "checked" state, custom symbols (✓/☐), and fires action on toggle. Great for options screens.
UIRadioGroup — a container that holds several UIRadioButton children and enforces only-one-selected. Auto-handles keyboard arrows + mouse.
UIProgressBar — horizontal bar (█▓░ style) with optional % text or label. Can be indeterminate (animated pulsing) or value-based. Perfect for loading, health, XP, download progress.
UITextField — single-line editable text input with blinking cursor. Handles backspace, typing, copy/paste basics, and has a "placeholder" when empty.
UIHotkeyLabel — like UILabel but shows a key binding next to the text (e.g. "Save    [F5]") and can highlight the key when focused.
UIGauge — circular or vertical bar version of progress (like old DOS fuel gauges). Fun for retro dashboards.

Input / selection widgets

UIDropdown — compact button that opens a floating list of options when clicked/focused (like your spinner but with many choices). Can be searchable if you ever add text input.
UINumericStepper — your UISpinner but only numbers, with min/max and optional suffix ("hp", "ms", "%").
UIValueBar — slider-like but shows the actual number inside the filled bar (e.g. "██████ 73/100"). Nice for health/mana bars in game UIs.

Containers & layout helpers

UIPanel — a box with an optional title bar at the top (like a window). Children layout inside the content area. Auto-draws border or background.
UITabBar + UITabPanel — horizontal tabs at the top (or left), each switching a different child panel. Only one tab visible at a time.
UIGrid — 2D grid layout (rows × cols). Children fill cells automatically. Super useful for inventory, skill grids, keyboard layouts, color palettes.
UIScrollBox — any container that can scroll vertically/horizontally when content is bigger than its size. Would need a thin scrollbar (made of │ or █ characters).
UICollapsible — like a VBox but one header that expands/collapses the rest (great for "Advanced Settings" sections).

Fancy / composite widgets

UIList — vertical list of items with automatic selection highlight. Supports paging, search filtering, and custom item renderers (so you can put buttons, spinners, etc. inside rows).
UITree — collapsible tree view (folders with +/–). Perfect for file browsers or nested config menus.
UIConsoleLog — scrolling read-only text area that auto-appends lines and keeps the bottom visible (like a debug console or chat log).
UIStatusLine — fixed bottom (or top) bar that can show multiple pieces of info (e.g. "FPS: 60  |  Gold: 420  |  Time: 12:34"). Updates live.
UIMiniMap — tiny canvas-inside-canvas for a 2D overview (if you ever draw small maps).

Utility / polish elements

UIDivider — simple horizontal or vertical line (─ or │) that expands to fill available space. Great for separating sections in a VBox.
UISpacerFlexible — like your UISpacer but can expand to push other elements apart (e.g. push buttons to bottom of screen).
UITooltip — floating label that appears when hovering another element (or focused with keyboard). Could auto-position itself.
UIModalDialog — a centered panel that dims the background and captures all input until closed (for "Are you sure?" prompts).

Bonus wild ideas for later

UIKnob — rotary dial style control (click and drag to rotate) for old-school feel.
UIColorSwatch — grid of colored blocks you can pick from (16-color palette style).
UIAnimation — a widget that cycles through a list of frames (e.g. spinning loader or animated icon).

You could combine these too — e.g. a UISettingsPage that is just a UIPanel containing a UIVBox full of UILabel + UISlider + UICheckbox rows.
