import { patch_element } from "../helpers/patch_function";
import { apply_card_mod } from "../helpers/apply_card_mod";
import { ModdedElement } from "../helpers/apply_card_mod";

/*
Patch the hui-grid-section element to on first update:
- config is available in this._config as set by parent hui-section
*/

@patch_element("hui-grid-section")
class HuiGridSectionPatch extends ModdedElement {
  _config;
  firstUpdated(_orig, ...args) {
    _orig?.(...args);
    apply_card_mod(
      this,
      "grid-section",
      this._config.card_mod,
      { config: this._config },
      true,
      "type-grid-section"
    );
  }
}

/*
Patch the hui-section element to on first update:
- patch can only apply to strategies where cards can be modified
- apply card-mod to cards per types in card-mod config
*/

@patch_element("hui-section")
class HuiSectionPatch extends ModdedElement {
  async _createCards(_orig, ...args) {
    const strategyConfig = (this as LovelaceSection).config?.strategy;
    const dynamicConfig: LovelaceSectionConfig = { ...args[0] };
    const cardMod = strategyConfig?.card_mod;
    const cards = dynamicConfig.cards;
    if (cardMod && cards) {
      Object.entries(cards).forEach(([idx, card]) => {
        const cardType = card.type;
        if (cardType && cardType in cardMod) {
          cardMod.debug &&
            console.log(
              "CardMod Debug: adding card-mod to card",
              card,
              "with",
              cardMod[cardType]
            );
          cards[idx] = {
            ...card,
            card_mod: cardMod[cardType],
          };
        }
      });
    }
    _orig?.(dynamicConfig);
  }
}

interface LovelaceSection extends Node {
  config?: LovelaceSectionConfig;
}

interface LovelaceCardConfig {
  type?: string;
  card_mod?: { [key: string]: any };
}

interface LovelaceSectionConfig {
  strategy?: { [key: string]: any };
  type?: string;
  cards?: LovelaceCardConfig[];
  card_mod?: { [key: string]: any };
}
