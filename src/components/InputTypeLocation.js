import React from 'react';
import PropTypes from 'prop-types';
import Geosuggest from 'react-geosuggest';
import classNames from 'classnames';
import Location from './Location';
import '../static/styles/geosuggest.css';
import { get } from 'lodash';

const pick = (htmlString, attr) => {
  if (htmlString.indexOf(attr) === -1) return null;
  let res = htmlString.substr(htmlString.indexOf(attr) + attr.length + 2);
  return res.substr(0, res.indexOf('</span>'));
};

class InputTypeLocation extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { value: props.defaultValue || props.value || {} };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value != this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }

  handleChange(value) {
    console.log('>>> handleChange', value);
    if (!value) {
      this.setState({ value: {} });
      return this.props.onChange({});
    }
    let countryCode;
    value.gmaps.address_components.map(ac => {
      if (!countryCode && ac.short_name.length === 2 && ac.types.includes('country')) {
        countryCode = ac.short_name;
      }
    });
    const label = value.label && value.label.replace(/,.+/, '');
    const location = {
      name: label,
      address: pick(value.gmaps.adr_address, 'street-address'),
      zipcode: pick(value.gmaps.adr_address, 'postal-code'),
      city: pick(value.gmaps.adr_address, 'locality'),
      countryCode,
      lat: value.location.lat,
      long: value.location.lng,
    };
    console.log('>>> location', location);
    this.setState({ value: location });
    return this.props.onChange(location);
  }

  render() {
    const options = this.props.options || { types: ['establishment', 'geocode'] };

    return (
      <div className={classNames('InputTypeLocation', this.props.className)}>
        <Geosuggest
          onSuggestSelect={event => this.handleChange(event)}
          placeholder={this.props.placeholder}
          initialValue={get(this.props, 'defaultValue.name')}
          {...options}
        />
        <Location location={this.state.value} showTitle={false} />
      </div>
    );
  }
}

export default InputTypeLocation;
