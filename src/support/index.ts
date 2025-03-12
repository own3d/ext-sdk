// noinspection JSUnusedGlobalSymbols

import * as WebFont from "webfontloader";

interface BorderRadius {
    multiple: boolean;
    radius: number;
    "top-left": number;
    "top-right": number;
    "bottom-left": number;
    "bottom-right": number;
}

interface FontSettings {
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

type CssValue = string | number | undefined;

interface CssProperties {
    [key: string]: CssValue;
}

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

    return style;
}

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

export function lazyLoadFont(object: CssProperties): CssProperties {
    if (object.fontFamily) {
        loadFont(object.fontFamily);
    }
    return object;
}
