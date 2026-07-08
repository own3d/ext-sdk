// noinspection JSUnusedGlobalSymbols

import * as WebFont from "webfontloader";

/**
 * Describes a border radius configuration used by {@link radius}.
 */
export interface BorderRadius {
    multiple: boolean;
    radius: number;
    "top-left": number;
    "top-right": number;
    "bottom-left": number;
    "bottom-right": number;
}

/**
 * Font-related settings used by {@link textStyle}.
 */
export interface FontSettings {
    "font-color": string;
    "font-family": string;
    "font-weight": number;
    "font-size": number;
    "text-align": string;
    "font-style": string;
    "letter-spacing": number;
    "line-height": number;
    "text-indent": number;
    "font-casing": string;
}

export type CssValue = string | number | undefined;

export interface CssProperties {
    [key: string]: CssValue;
}

/**
 * Build a CSS-compatible object from {@link FontSettings}.
 *
 * This helper converts the extension's font settings into an object that can
 * be used for inline styles in React/Vue/DOM. You can pass an optional
 * transformer map to run custom conversions per property.
 *
 * If `font-color` is a CSS gradient (e.g. `linear-gradient(...)`) the returned
 * style renders gradient text via `background-clip: text`, setting `color` to
 * `transparent`. Apply the result to a text-only element; `currentColor`-based
 * children (icons) then need their own explicit color.
 *
 * @param fontSettings - Partial font settings received from the extension.
 * @param transformer - Optional converter functions applied per property.
 * @returns A plain object mapping CSS property names to values.
 *
 * @example
 * ```ts
 * import { textStyle } from '@own3d/sdk'
 * const style = textStyle({ 'font-size': 16, 'font-family': 'Inter' })
 * // style.fontSize === '16px'
 * ```
 */
export function textStyle(
    fontSettings: FontSettings | undefined | null,
    transformer: { [key: string]: (x: CssValue) => CssValue } = {},
): CssProperties {
    const modifiers: {
        [key: string]: {
            default: CssValue;
            suffix: string | null;
            id: keyof FontSettings;
        };
    } = {
        color: { default: "#fffff", suffix: null, id: "font-color" },
        fontFamily: { default: "Inter", suffix: null, id: "font-family" },
        fontWeight: { default: 400, suffix: null, id: "font-weight" },
        fontSize: { default: 14, suffix: "px", id: "font-size" },
        textAlign: { default: "left", suffix: null, id: "text-align" },
        fontStyle: { default: "normal", suffix: null, id: "font-style" },
        letterSpacing: { default: 0, suffix: "px", id: "letter-spacing" },
        lineHeight: { default: 1.2, suffix: null, id: "line-height" },
        textIndent: { default: 0, suffix: "px", id: "text-indent" },
        textTransform: { default: "none", suffix: null, id: "font-casing" },
    };

    const style: CssProperties = {};

    // check if modifier exists in values and if not set default value
    Object.keys(modifiers).forEach((modifierKey) => {
        const modifier = modifiers[modifierKey];
        let value = fontSettings?.[modifier.id];

        if (transformer[modifier.id]) {
            value = transformer[modifier.id](value);
        }

        if (modifier.suffix) {
            style[modifierKey] = value
                ? value + modifier.suffix
                : modifier.default + modifier.suffix;
        } else {
            style[modifierKey] = value ? value : modifier.default;
        }
    });

    // A CSS gradient can't be used as a `color`; to render gradient text it has
    // to be painted as a background and clipped to the glyphs. Solid colors are
    // left untouched, so this is transparent to existing callers. Note: the
    // returned style makes `color` transparent, so any non-text descendants
    // that rely on `currentColor` (icons, etc.) need their own explicit color.
    if (typeof style.color === "string" && style.color.includes("gradient")) {
        style.backgroundImage = style.color;
        style.backgroundClip = "text";
        style.WebkitBackgroundClip = "text";
        style.color = "transparent";
        style.WebkitTextFillColor = "transparent";
    }

    return style;
}

/**
 * Convert a {@link BorderRadius} into a CSS properties object.
 *
 * If `multiple` is true the helper returns per-corner properties, otherwise
 * it returns a single `borderRadius` value.
 *
 * @param borderRadius - Border radius settings from the extension.
 * @returns A CSS properties object usable in inline styles.
 *
 * @example
 * ```ts
 * import { radius } from '@own3d/sdk'
 * const css = radius({ multiple: false, radius: 6, 'top-left': 6, 'top-right': 6, 'bottom-left': 6, 'bottom-right': 6 })
 * // css.borderRadius === '6px'
 * ```
 */
export function radius(
    borderRadius: BorderRadius | undefined | null,
): CssProperties {
    if (!borderRadius) {
        return {};
    }
    if (borderRadius.multiple) {
        return {
            borderTopLeftRadius: `${borderRadius["top-left"]}px`,
            borderTopRightRadius: `${borderRadius["top-right"]}px`,
            borderBottomRightRadius: `${borderRadius["bottom-left"]}px`,
            borderBottomLeftRadius: `${borderRadius["bottom-right"]}px`,
        };
    }

    return {
        borderRadius: `${borderRadius["radius"]}px`,
    };
}

/**
 * Check whether a key is present in an array or truthy in an object.
 *
 * This small utility supports form controls where the checked state may be
 * represented as an array of selected keys or an object map.
 *
 * @param input - An array of strings or an object map.
 * @param key - The key to test for presence.
 * @returns True if the key is considered checked.
 *
 * @example
 * ```ts
 * import { checked } from '@own3d/sdk'
 * checked(['a','b'], 'a') // true
 * checked({ a: true }, 'a') // true
 * ```
 */
export function checked(
    input: Array<string> | Record<string, unknown>,
    key: string,
): boolean {
    if (Array.isArray(input)) {
        return input.includes(key);
    }

    return input[key] === true;
}

const cachedFonts: CssValue[] = [];

/**
 * Load a web font using the bundled webfontloader library.
 *
 * This helper is idempotent — it will not request the same font twice.
 *
 * @param fontFamily - The font family name to load (e.g. "Inter").
 *
 * @example
 * ```ts
 * import { loadFont } from '@own3d/sdk'
 * loadFont('Inter')
 * ```
 */
export function loadFont(fontFamily: CssValue): void {
    if (!fontFamily || cachedFonts.includes(fontFamily)) {
        return;
    }

    WebFont.load({
        google: {
            families: [`${fontFamily}:100,200,300,400,500,600,700,800,900`],
            api: "https://fonts.bunny.net/css",
        },
        fontloading: (familyName: string) => {
            cachedFonts.push(familyName);
        },
        classes: false,
    });
}

/**
 * Calls {@link loadFont} for `fontFamily` in the provided CSS object and
 * returns the same object for chaining.
 *
 * @example
 * ```ts
 * import { lazyLoadFont } from '@own3d/sdk'
 * const css = lazyLoadFont({ fontFamily: 'Inter' })
 * ```
 */
export function lazyLoadFont(object: CssProperties): CssProperties {
    if (object.fontFamily) {
        loadFont(object.fontFamily);
    }
    return object;
}
