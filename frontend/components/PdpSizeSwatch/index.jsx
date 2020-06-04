import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import classnames from 'classnames';
import isMatch from 'lodash.ismatch';
import { logger, ThemeContext, withCurrentProduct } from '@shopgate/engage/core';
import { useNavigateToVariant, useConditioner } from '../../variants/hook';
import connect from './connector';

const styles = {
  default: css({
    width: 36,
    height: 36,
    borderRadius: '100%',
    marginRight: 8,
    marginBottom: 8,
  }),
  selected: css({
    border: '2px solid #000',
  }).toString(),
  disabled: css({
    opacity: 0.5,
  }).toString(),
};

/**
 * @param {Object} props Props
 * @return {JSX}
 */
const PdpSizeSwatch = ({ swatch, products }) => {
  const { contexts: { ProductContext } } = useContext(ThemeContext);
  const { characteristics, setCharacteristics } = useContext(ProductContext);

  useConditioner('PdpSizeSwatch', () => {
    if (!swatch) {
      return true;
    }
    const result = Boolean(characteristics && !!characteristics[swatch.id]);
    logger.assert(result, 'PdpSizeSwatch is not fulfilled');
    return result;
  });
  useNavigateToVariant(products);

  const values = useMemo(() => {
    if (!swatch || !swatch.values.length) {
      return null;
    }

    const { [swatch.id]: ignore, ...selfOmitted } = characteristics || {};

    return swatch.values.map(value => ({
      ...value,
      selected: characteristics && characteristics[swatch.id] === value.id,
      selectable: !characteristics || products.some(product => isMatch(product.characteristics, {
        ...selfOmitted,
        [swatch.id]: value.id,
      })),
    }));
  }, [swatch, products, characteristics]);

  if (!values || !values.length) {
    return null;
  }

  return (
    <ul style={{ display: 'flex', margin: '20px' }}>
      {values.map(value => (
        <li
          key={value.id}
          onClick={() => value.selectable && setCharacteristics({
            ...characteristics,
            [swatch.id]: value.id,
          })}
          className={classnames({
            [styles.default]: true,
            [styles.selected]: value.selected,
            [styles.disabled]: !value.selectable,
          })}
        >
          {value.label}
        </li>
      ))}
    </ul>
  );
};

PdpSizeSwatch.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape()),
  swatch: PropTypes.shape(),
};

PdpSizeSwatch.defaultProps = {
  products: null,
  swatch: null,
};

export default withCurrentProduct(connect(PdpSizeSwatch));
