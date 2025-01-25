import { BaseHtmlElement } from "../common/BaseElement.js";

const actionButtonName = "action-button";

const actionsStyle = `
.actions {
  display: flex;
  gap: 0.25rem;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #fff;
  border: 1px solid var(--border-color);

  > button {
    flex: 1 1 auto;
    width: 100%;
    text-align: left;
  }
}`;

window.customElements.define(
  actionButtonName,
  class ActionButton extends BaseHtmlElement {
    static get observedAttributes() {
      return ["open"];
    }

    constructor() {
      super();
      this.attributesProps(ActionButton.observedAttributes);
    }

    render() {
      const popover = this.el(
        "div",
        {
          key: "popover",
          popover: "",
          className: "popover",
        },
        this.el("slot", {
          key: "slot",
          onclick: () => {
            // TODO: should setTimeout, but why?
            setTimeout(() => {
              popover.hidePopover();
            }, 0);
          },
        }),
      );

      const button = this.el(
        "button",
        {
          key: "button",
          className: "action-button text-button",
          onclick: () => {
            popover.showPopover();
          },
        },
        this.el("i", {
          key: "icon",
          className: ["fa-solid", "fa-ellipsis-vertical"].join(" "),
        }),
        popover,
      );

      return [
        button,
        this.el("style", {
          key: "style",
          textContent: `
            ${this.baseStyle}
            .action-button {
              anchor-name: --action-button;
            }

            .popover {
              all: unset;
              position: fixed;
              position-anchor: --action-button;
              top: anchor(bottom);
              right: anchor(right);
              position-area: bottom span-left;
              position-try: normal flip-block;

              &:not(:popover-open):not(dialog[open]) {
                display: none;
              }
            }
          `,
        }),
      ];
    }
  },
);

export { actionButtonName, actionsStyle };
