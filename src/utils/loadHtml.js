import mustache from "./mustache.min.mjs";
const loadCache = {};

export const loadStatic = (base, {
    path,
    withCache = true,
} = {}) => {
    const htmlUrl = new URL(path, base);

    if (loadCache[htmlUrl] && withCache) {
        return loadCache[htmlUrl];
    }

    return fetch(htmlUrl)
        .then(response => response.text())
        .then(result => {
            if (withCache) {
                loadCache[htmlUrl] = result;
            }

            return result;
        });
}

const renderTemplate = (raw, {props, base} = {}) => {
    let text = raw;

    if (typeof props === 'object') {
        text = mustache.render(text, {baseUrl: new URL('.', base), ...props});
    }

    const template = document.createElement("template");
    template.innerHTML = text;

    return template.content;
}

export const importTemplate = async (base, {props, path = './template.html'} = {}) => {
    const text = await loadStatic(base, {path});

    return renderTemplate(text, {props, base});
};

export const importTemplateFromCache = (base, {props, path = './template.html'}) => {
    const text = loadCache[new URL(path, base)];

    return renderTemplate(text, {props, base});
} 

export const getCssTag = (base, {path = "styles.css"} = {}) => (
    `<link rel="stylesheet" type="text/css" href="${new URL(path, base).href}" />`
)