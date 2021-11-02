import {LocalizedStringId} from '#service/localization/strings'; // eslint-disable-line no-unused-vars
import {createElementWithAttributes} from '#core/dom';
import {devAssert} from '#utils/log';
import {getLocalizationService} from './amp-story-localization-service';
import {hasOwn} from '#core/types/object';
import {isArray} from '#core/types';

/**
 * @typedef {{
 *   tag: string,
 *   attrs: (!JsonObject|undefined),
 *   localizedStringId: (!LocalizedStringId|undefined),
 *   unlocalizedString: (string|undefined),
 *   localizedLabelId: (!LocalizedStringId|undefined),
 *   children: (!Array<!ElementDef>|undefined),
 * }}
 */
export let ElementDef;

// Original functions

/**
 * @param {!Document} doc
 * @param {!ElementDef|!Array<!ElementDef>} elementsDef
 * @return {!Node}
 */
export function renderSimpleTemplate(doc, elementsDef) {
  if (isArray(elementsDef)) {
    return renderMulti(doc, /** @type {!Array<!ElementDef>} */ (elementsDef));
  }
  return renderSingle(doc, /** @type {!ElementDef} */ (elementsDef));
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
export function renderAsElement(doc, elementDef) {
  return renderSingle(doc, elementDef);
}

/**
 * @param {!Document} doc
 * @param {!Array<!ElementDef>} elementsDef
 * @return {!Node}
 */
function renderMulti(doc, elementsDef) {
  const fragment = doc.createDocumentFragment();
  elementsDef.forEach((elementDef) =>
    fragment.appendChild(renderSingle(doc, elementDef))
  );
  return fragment;
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
function renderSingle(doc, elementDef) {
  const el = hasOwn(elementDef, 'attrs')
    ? createElementWithAttributes(
        doc,
        elementDef.tag,
        /** @type {!JsonObject} */ (elementDef.attrs)
      )
    : doc.createElement(elementDef.tag);

  const hasLocalizedTextContent = hasOwn(elementDef, 'localizedStringId');
  const hasLocalizedLabel = hasOwn(elementDef, 'localizedLabelId');
  if (hasLocalizedTextContent || hasLocalizedLabel) {
    const localizationService = getLocalizationService(devAssert(doc.body));
    devAssert(localizationService, 'Could not retrieve LocalizationService.');

    if (hasLocalizedTextContent) {
      el.textContent = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedStringId)
      );
    }

    if (hasLocalizedLabel) {
      const labelString = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedLabelId)
      );
      if (labelString) {
        el.setAttribute('aria-label', labelString);
      }
    }
  }

  if (hasOwn(elementDef, 'unlocalizedString')) {
    el.textContent = elementDef.unlocalizedString;
  }

  if (hasOwn(elementDef, 'children')) {
    el.appendChild(
      renderMulti(doc, /** @type {!Array<!ElementDef>} */ (elementDef.children))
    );
  }

  return el;
}

// New functions to support Shadow AMP stories

/**
 * @param {!Document} doc
 * @param {!ElementDef|!Array<!ElementDef>} elementsDef
 * @param {!Element} storyEl
 * @return {!Node}
 */
export function renderSimpleTemplateForStory(doc, elementsDef, storyEl) {
  if (isArray(elementsDef)) {
    return renderMultiForStory(
      doc,
      /** @type {!Array<!ElementDef>} */ (elementsDef),
      storyEl
    );
  }
  return renderSingleForStory(
    doc,
    /** @type {!ElementDef} */ (elementsDef),
    storyEl
  );
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @param {!Element} storyEl
 * @return {!Element}
 */
export function renderAsElementForStory(doc, elementDef, storyEl) {
  return renderSingleForStory(doc, elementDef, storyEl);
}

/**
 * @param {!Document} doc
 * @param {!Array<!ElementDef>} elementsDef
 * @param {!Element} storyEl
 * @return {!Node}
 */
function renderMultiForStory(doc, elementsDef, storyEl) {
  const fragment = doc.createDocumentFragment();
  elementsDef.forEach((elementDef) =>
    fragment.appendChild(renderSingleForStory(doc, elementDef, storyEl))
  );
  return fragment;
}

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @param {!Element} storyEl
 * @return {!Element}
 */
function renderSingleForStory(doc, elementDef, storyEl) {
  const el = hasOwn(elementDef, 'attrs')
    ? createElementWithAttributes(
        doc,
        elementDef.tag,
        /** @type {!JsonObject} */ (elementDef.attrs)
      )
    : doc.createElement(elementDef.tag);

  const hasLocalizedTextContent = hasOwn(elementDef, 'localizedStringId');
  const hasLocalizedLabel = hasOwn(elementDef, 'localizedLabelId');
  if (hasLocalizedTextContent || hasLocalizedLabel) {
    const localizationService = getLocalizationService(devAssert(storyEl));
    devAssert(localizationService, 'Could not retrieve LocalizationService.');

    if (hasLocalizedTextContent) {
      el.textContent = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedStringId)
      );
    }

    if (hasLocalizedLabel) {
      const labelString = localizationService.getLocalizedString(
        /** @type {!LocalizedStringId} */ (elementDef.localizedLabelId)
      );
      if (labelString) {
        el.setAttribute('aria-label', labelString);
      }
    }
  }

  if (hasOwn(elementDef, 'unlocalizedString')) {
    el.textContent = elementDef.unlocalizedString;
  }

  if (hasOwn(elementDef, 'children')) {
    el.appendChild(
      renderMultiForStory(
        doc,
        /** @type {!Array<!ElementDef>} */ (elementDef.children),
        storyEl
      )
    );
  }

  return el;
}
