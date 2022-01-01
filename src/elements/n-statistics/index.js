import { importTemplate, importTemplateFromCache } from "../../utils/loadHtml.js";
import { Storage } from "../../utils/storage.js";

const template = await importTemplate(import.meta.url, {props: {}});
const tableRow = await importTemplate(import.meta.url, {path: './tableRow.html'});

export class Stat extends HTMLDivElement {
    static #isDefined = false
    static register() {
        if (Stat.#isDefined) {
            return;
        }

        customElements.define('n-statistics', Stat, {extends: 'div'});
        Stat.#isDefined = true;
    }

    #render() {
        const tableBody = this.shadowRoot.querySelector('table');
        const header = tableBody.querySelector('table thead');
        tableBody.innerHTML = '';
        tableBody.appendChild(header);

        const {results} = Storage.getLog();

        let prevDate = '';

        Object
            .entries(results)
            .sort(([date1], [date2]) => (date1 > date2 ? 1 : -1))
            .forEach(([date, dateResults]) => {
                let docFragment = document.createElement('template');
                docFragment = docFragment.appendChild(document.createElement('tbody'));

                dateResults.forEach(res => {
                    docFragment.appendChild(
                        importTemplateFromCache(import.meta.url, {
                            path: './tableRow.html',
                            props: {
                                date: prevDate === date ? null : date,
                                score: res.score,
                                n: res.settings.n,
                                sequences: res.settings.sequences.map(s => s.toLowerCase()).join(', '),
                                length: res.settings.length,
                                gamesNumber: dateResults.length
                            }
                        })
                    )
                    prevDate = date;
                });

                tableBody.appendChild(docFragment);
            })
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));

        this.#render();
    }

    render() {
        this.#render();
    }
}
