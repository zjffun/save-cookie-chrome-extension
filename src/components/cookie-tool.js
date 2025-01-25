import { BaseHtmlElement } from "../common/BaseElement.js";
import { cookieService } from "../services/cookie.js";
import { setCookie } from "../utils.js";
import { actionsStyle } from "./action-button.js";
import { cardItemName } from "./card-item.js";
import { showConfirmDialog } from "./confirm-dialog.js";
import { cookieItemName } from "./cookie-item.js";
import { floatingActionButtonName } from "./floating-action-button.js";
import { showErrorMessage, showSuccessMessage } from "./message.js";
import { showPrompt } from "./prompt.js";

const cookieToolName = "cookie-tool";

async function addCookie() {
  const [result, key] = await showPrompt("Please enter Cookie name");

  if (!result) {
    return;
  }

  const item = cookieService.createNewItem({
    key,
  });

  await cookieService.insert(item);
}

customElements.define(
  cookieToolName,
  class CookieTool extends BaseHtmlElement {
    cookieList = [];

    async updateCookieList() {
      this.cookieList = await cookieService.getList();
      this.updateView();
    }

    constructor() {
      super();

      cookieService.addOnChangeListener(async () => {
        await this.updateCookieList();
      });

      this.updateCookieList();
    }

    getCookieItem({ cookie, i, length }) {
      const cookieName = cookie?.key;

      const cookieItemEl = this.el(cookieItemName, {
        key: this.scopeKey("cookie-item"),
        cookie: cookie,
      });

      return this.el(
        cardItemName,
        {
          open: cookie?.open,
          key: this.scopeKey("container"),
        },
        this.el("span", {
          slot: "title",
          key: this.scopeKey("title"),
          className: "flex-auto-shrink-label",
          innerText: cookieName,
        }),
        this.el(
          "div",
          { slot: "content", key: this.scopeKey("content") },

          cookieItemEl,
        ),
        this.el(
          "div",
          {
            key: this.scopeKey("card-actions"),
            className: "actions",
            slot: "actions",
          },
          this.el("button", {
            key: this.scopeKey("card-action-set-value"),
            innerText: "Set Value",
            className: "text-button",
            onclick: async (e) => {
              try {
                e.preventDefault();

                const [result, value] = await showPrompt(
                  `Please enter the new value of ${cookieName}`,
                );

                if (!result) {
                  return;
                }

                await setCookie({
                  name: cookieName,
                  value: value,
                });

                showSuccessMessage(`Set value successfully`);
                cookieItemEl.updateView();
              } catch (err) {
                console.error(err);
                showErrorMessage(err?.message || "Unknown error");
                return;
              }
            },
          }),
          i > 0 &&
            this.el("button", {
              key: this.scopeKey("card-action-up"),
              innerText: "Move Up",
              className: "text-button",
              onclick: async (e) => {
                e.preventDefault();
                await cookieService.moveUp(cookie.id);
              },
            }),
          i < length - 1 &&
            this.el("button", {
              key: this.scopeKey("card-action-down"),
              innerText: "Move Down",
              className: "text-button",
              onclick: async (e) => {
                e.preventDefault();
                await cookieService.moveDown(cookie.id);
              },
            }),
          this.el("button", {
            key: this.scopeKey("card-action-delete"),
            innerText: "Delete",
            className: "text-button text-button--danger",
            onclick: async (e) => {
              e.preventDefault();
              try {
                await showConfirmDialog(`Confirm delete ${cookieName}?`, {
                  confirmText: "Delete",
                  confirmClassName: "button--danger",
                });
              } catch {
                return;
              }

              await cookieService.deleteItem(cookie.id);
            },
          }),
        ),
      );
    }

    getCookieList() {
      const cookieEls = [];

      let i = 0;
      for (const cookie of this.cookieList) {
        this.withScope(`cookie-item-${cookie.id}`, () => {
          const cookieItem = this.getCookieItem({
            cookie,
            i,
            length: this.cookieList.length,
          });
          cookieEls.push(cookieItem);
        });
        i++;
      }

      return cookieEls;
    }

    render() {
      const fab = this.el(
        floatingActionButtonName,
        {
          key: "fab",
          onclick: () => {
            addCookie();
          },
        },
        this.el("i", {
          key: "fab-icon",
          className: "fa-solid fa-plus",
        }),
      );

      return [
        this.cookieList?.length &&
          this.el(
            "div",
            {
              key: "list",
              className: "list",
            },
            ...this.getCookieList(),
          ),

        !this.cookieList?.length &&
          this.el(
            "div",
            {
              key: "empty-info",
              className: "empty-info",
            },
            this.el("span", {
              key: "empty-info-text",
              textContent:
                "No Cookie, please click the right bottom button to ",
            }),
            this.el("a", {
              key: "empty-info-link",
              textContent: "add a Cookie",
              onclick: () => {
                addCookie();
              },
            }),
          ),

        fab,
        this.el("style", {
          key: "style",
          textContent: `
            ${this.baseStyle}
            ${actionsStyle}
            .list {
              display: flex;
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            .empty-info {
              padding: 1rem;
            }
          `,
        }),
      ];
    }
  },
);

export { cookieToolName };
