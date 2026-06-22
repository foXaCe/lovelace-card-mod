import { property } from "lit/decorators.js";
import { LitElement, html } from "lit";
import type {
  HomeAssistant,
  LovelaceCard,
  LovelaceCardConfig,
} from "custom-card-helpers";

const NO_STYLE = `
ha-card {
  background: none;
  box-shadow: none;
  border: none;
  transition: none;
}`;

// The element returned by loadCardHelpers().createCardElement, plus the Sections
// layout hooks HA may read off it that custom-card-helpers' LovelaceCard predates.
type WrappedCard = LovelaceCard & {
  getGridOptions?: () => unknown;
  getLayoutOptions?: () => unknown;
};

interface ModCardConfig extends LovelaceCardConfig {
  card: LovelaceCardConfig;
  report_size?: number;
}

class ModCard extends LitElement {
  _config?: ModCardConfig;
  _hass?: HomeAssistant;
  _hassResolve?: () => void;

  @property({ attribute: false }) card?: WrappedCard;

  setConfig(config: ModCardConfig) {
    this._config = JSON.parse(JSON.stringify(config)) as ModCardConfig;
    let style = this._config.card_mod?.style || this._config.style;

    if (style === undefined) {
      style = NO_STYLE;
    } else if (typeof style === "string") {
      style = NO_STYLE + style;
    } else if (style["."]) {
      style["."] = NO_STYLE + style["."];
    } else {
      style["."] = NO_STYLE;
    }

    this._config.card_mod = {
      style,
      debug: this._config.card_mod?.debug || false,
    };

    this.build_card(config.card);
  }

  async build_card(config: LovelaceCardConfig) {
    if (this._hass === undefined)
      await new Promise<void>((resolve) => (this._hassResolve = resolve));
    this._hassResolve = undefined;
    const helpers = await (window as any).loadCardHelpers();
    const card = (await helpers.createCardElement(config)) as WrappedCard;
    card.hass = this._hass;
    this.card = card;
  }

  firstUpdated() {
    window.setTimeout(() => {
      if (this.card?.shadowRoot?.querySelector("ha-card")) {
        console.info(
          "%cYou are doing it wrong!",
          "color: red; font-weight: bold"
        );
        const cardName = this.card.localName.replace(/hui-(.*)-card/, "$1");

        console.info(
          `mod-card should NEVER be used with a card that already has a ha-card element, such as ${cardName}`
        );
      }
    }, 3000);
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this.card) this.card.hass = hass;
    if (this._hassResolve) this._hassResolve();
  }

  render() {
    return html` <ha-card modcard> ${this.card} </ha-card> `;
  }

  // mod-card is a wrapper: Home Assistant reads the layout/sizing hooks off the
  // mod-card element, never off the card it wraps. Forward them to the child so
  // the embedded card keeps its intended footprint — without this delegation a
  // wrapped card falls back to HA's defaults (12 columns / ignored rows in the
  // Sections view, size 1 in Masonry).
  getGridOptions() {
    return this.card?.getGridOptions?.();
  }

  getLayoutOptions() {
    return this.card?.getLayoutOptions?.();
  }

  getCardSize() {
    if (this._config?.report_size) return this._config.report_size;
    return this.card?.getCardSize?.() ?? 1;
  }
}

if (!customElements.get("mod-card")) {
  customElements.define("mod-card", ModCard);
}
(async () => {
  // See explanation in card-mod.ts

  while (customElements.get("home-assistant") === undefined)
    await new Promise((resolve) => window.setTimeout(resolve, 100));

  if (!customElements.get("mod-card")) {
    customElements.define("mod-card", ModCard);
  }
})();
