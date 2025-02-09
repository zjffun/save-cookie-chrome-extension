import { BaseHtmlElement } from "../common/BaseElement.js";
import { cookieService } from "../services/cookie.js";
import { getCookies, setCookie } from "../utils.js";
import { copyIconName } from "./copy-icon.js";
import { showErrorMessage, showSuccessMessage } from "./message.js";
import { showPrompt } from "./prompt.js";

const cookieItemName = "cookie-item";

customElements.define(
  cookieItemName,
  class CookieItem extends BaseHtmlElement {
    static get observedAttributes() {
      return ["cookie"];
    }

    #cookie = null;

    set cookie(d) {
      this.#cookie = d;
      this.updateView();
    }

    get cookie() {
      return this.#cookie;
    }

    getCookieValues(cookie) {
      const values = cookie?.values || [];

      const items = [];
      for (const value of values) {
        this.withScope(`cookie-value-${value.id}`, () => {
          const cookieName = cookie.key;
          const span = this.el("span", {
            key: this.scopeKey("title"),
            className: "flex-auto-shrink-label",
            innerText: value.name,
          });

          const set = this.el("button", {
            key: this.scopeKey("set"),
            textContent: "Use",
            className: "text-button",
            onclick: async (e) => {
              e.preventDefault();

              try {
                await setCookie({
                  name: cookieName,
                  value: value.value,
                });
              } catch (error) {
                console.error(error);
                showErrorMessage(`Set value failed. ${error}`);
                return;
              }

              showSuccessMessage(`Set value successfully`);
              this.updateView();
            },
          });

          const copy = this.el(copyIconName, {
            key: this.scopeKey("copy"),
            value: value.value,
          });

          const deleteItem = this.el(
            "button",
            {
              key: this.scopeKey("delete"),
              className: "text-button hover-show-action",
              onclick: async (e) => {
                e.preventDefault();
                cookieService.deleteValue({
                  id: cookie.id,
                  valueId: value.id,
                });
              },
            },
            this.el("i", {
              key: this.scopeKey("delete-icon"),
              className: ["fa-solid", "fa-trash"].join(" "),
            }),
          );

          const li = this.el(
            "li",
            {
              key: this.scopeKey("li"),
              className: "cookie-item line-container",
            },
            span,
            set,
            copy,
            deleteItem,
          );
          items.push(li);
        });
      }

      return items;
    }

    getInputType(showingValue) {
      if (showingValue) {
        return "text";
      }

      return "password";
    }

    getCurrentCookie(cookie) {
      const cookieName = cookie?.key;

      return this.withScope("current-cookie", () => {
        const input = this.el("input", {
          key: "input",
          type: this.getInputType(cookie?.showingValue),
          disabled: true,
        });

        if (cookieName) {
          getCookies([cookieName]).then((d) => {
            const value = d?.[cookieName]?.value;
            input.value = value || "";
          });
        }

        return this.el(
          "div",
          {
            key: "container",
            className: "current-cookie",
          },
          input,
          this.el(
            "button",
            {
              key: "showing",
              className: "text-button",
              onclick: async (e) => {
                e.preventDefault();

                const showingValue = !cookie?.showingValue;

                cookieService.setShowingValue({
                  id: cookie.id,
                  showingValue,
                });

                input.type = this.getInputType(showingValue);
              },
            },
            this.el("i", {
              key: "showing-icon",
              className: [
                "fa-solid",
                cookie.showingValue ? "fa-eye" : "fa-eye-slash",
              ].join(" "),
            }),
          ),
          this.el(
            "button",
            {
              key: "save",
              className: "text-button",
              onclick: async (e) => {
                e.preventDefault();

                let cookieValue;

                try {
                  cookieValue = (await getCookies([cookieName]))?.[cookieName]
                    ?.value;
                } catch (error) {
                  console.error(error);
                  showErrorMessage(`Save value failed. ${error}`);
                  return;
                }

                const [result, name] = await showPrompt(
                  "Please enter a name for the saving cookie",
                );

                if (!result) {
                  return;
                }

                cookieService.addValue({
                  id: cookie.id,
                  name: name,
                  value: cookieValue,
                });
              },
            },
            this.el("i", {
              key: "save-icon",
              className: "fa-solid fa-save",
            }),
          ),
        );
      });
    }

    getCookieItem() {
      return this.el(
        "div",
        {
          key: this.scopeKey("content"),
        },

        this.getCurrentCookie(this.cookie),

        this.el(
          "ul",
          {
            key: this.scopeKey("values"),
          },
          ...this.getCookieValues(this.cookie),
        ),
      );
    }

    render() {
      return [
        this.getCookieItem(),
        this.el("style", {
          key: "style",
          textContent: `
            ${this.baseStyle}
            .current-cookie {
              display: flex;
              gap: 0.5rem;

              input {
                flex: 1 1 auto;
              }
            }
          `,
        }),
      ];
    }
  },
);

export { cookieItemName };
