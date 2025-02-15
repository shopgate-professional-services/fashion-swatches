import { createSelector } from 'reselect';
import { getProducts, getProduct } from '@shopgate/engage/product';
import { getDeviceInformation } from '@shopgate/engage/core';
import { getColorSwatch, getSizeSwatches, getSwatchCharacteristicIds as getIds } from './helpers';
import { linkSwatchConfiguration } from '../config';

/**
 * @param {Object} state .
 * @return {Object}
 */
const getState = (state) => {
  if (!state.extensions['@shopgate-project/fashion-swatches/variants']) {
    return {};
  }
  return state.extensions['@shopgate-project/fashion-swatches/variants'];
};

/**
 * @returns {null|Object[]}
 */
export const getProductVariants = createSelector(
  getState,
  (_, { productId }) => productId,
  (state, productId) => state[productId] || null
);

/**
 * @returns {null|Object[]}
 */
export const getProductVariantsProducts = createSelector(
  getProductVariants,
  variants => variants && variants.products
);

/**
 * @returns {null|Object[]}
 */
export const getProductVariantsProductsData = createSelector(
  getProductVariantsProducts,
  getProducts,
  (products, productsState) => {
    if (!products || !productsState) {
      return null;
    }

    return products
      .map(p => ({
        ...p,
        featuredImageBaseUrl: productsState[p.id]
          && productsState[p.id].productData
          && productsState[p.id].productData.featuredImageBaseUrl,
      }));
  }
);

/**
 * @returns {null|Object[]}
 */
export const getSizeCharacteristics = createSelector(
  getProductVariants,
  variants => getSizeSwatches(variants)
);

/**
 * @returns {null|Object[]}
 */
export const getColorCharacteristic = createSelector(
  getProductVariants,
  variants => getColorSwatch(variants)
);

/**
 * @returns {null|Object[]}
 */
export const getColorCharacteristicId = createSelector(
  getColorCharacteristic,
  char => char && char.id
);

/**
 * @returns {null|Object[]}
 */
export const getSwatchCharacteristicIds = createSelector(
  getColorCharacteristic,
  getSizeCharacteristics,
  (one, two) => getIds(one, ...two)
);

export const getIsTablet = createSelector(
  getDeviceInformation,
  deviceInformation => deviceInformation && deviceInformation.type === 'tablet'
);

export const getLinkSwatch = createSelector(
  getProduct,
  (productData) => {
    if (
      !productData ||
      productData.isFetching ||
      !productData.additionalProperties ||
      !linkSwatchConfiguration ||
      !linkSwatchConfiguration.property
    ) {
      return null;
    }

    const linkSwatchProperty = linkSwatchConfiguration.property;

    const linkSwatch = productData.additionalProperties
      .find(prop => prop.label === linkSwatchProperty);

    if (linkSwatch) {
      return linkSwatch.value;
    }

    return null;
  }
);
