import { BaseHtmlElement } from "../common/BaseElement.js";
import { actionButtonName } from "./action-button.js";

const cardItemName = "card-item";

window.customElements.define(
  cardItemName,
  class CardItem extends BaseHtmlElement {
    static get observedAttributes() {
      return ["title", "open", "title-gray"];
    }

    constructor() {
      super();
      this.attributesProps(CardItem.observedAttributes);
      this.eventsProps(["toggle"]);
    }

    render() {
      const container = this.el(
        "details",
        {
          key: "details-key",
          open: this.open,
          ontoggle: (e) => {
            this.dispatchEvent(
              new CustomEvent("toggle", {
                detail: {
                  open: e.newState === "open",
                },
              }),
            );
          },
        },
        this.el(
          "summary",
          {
            key: "summary-key",
            className: this["title-gray"] ? "gray" : "",
          },
          this.el("slot", {
            key: "title-slot",
            name: "title",
          }),
          this.el(
            actionButtonName,
            {
              key: "action-button-key",
              className: "action-button",
            },
            this.el("slot", {
              key: "actions-slot",
              name: "actions",
            }),
          ),
        ),
        this.el(
          "div",
          {
            key: "content-div-key",
            className: "content",
          },
          this.el("slot", {
            key: "content-slot",
            name: "content",
          }),
        ),
      );

      return [
        container,
        this.el("style", {
          key: "style",
          textContent: `
          ${this.baseStyle}
          details {
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
            overflow: hidden;

            summary {
              display: flex;
              gap: 0.25rem;
              align-items: center;
              padding: 0.5rem;
              font-weight: bold;
              font-size: 1rem;
              background: linear-gradient(90deg, var(--blue-100) 0%, var(--blue-50) 50%, var(--blue-100) 100%);
              color: var(--primary-color);
              cursor: pointer;

              &.gray {
                background: linear-gradient(90deg, var(--grey-100) 0%, var(--grey-50) 50%, var(--grey-100) 100%);
                color: var(--grey-600);
              }

              .action-button {
                margin-left: auto;
              }
            }

            .content {
              padding: 0.5rem;
            }
          }
        `,
        }),
      ];
    }
  },
);

export { cardItemName };
