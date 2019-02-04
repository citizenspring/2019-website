import React from 'react';
import PropTypes from 'prop-types';
import Geosuggest from 'react-geosuggest';
import classNames from 'classnames';
import Location from './Location';

class InputTypeLocation extends React.Component {
  static propTypes = {
    value: PropTypes.object,
    className: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { value: props.value || {} };
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
    const label = value.label && value.label.replace(/,.+/, '');
    const location = {
      name: label,
      address: value.gmaps.formatted_address,
      lat: value.location.lat,
      long: value.location.lng,
    };
    this.setState({ value: location });
    return this.props.onChange(location);
  }

  render() {
    const options = this.props.options || {};

    return (
      <div className={classNames('InputTypeLocation', this.props.className)}>
        <Geosuggest
          onSuggestSelect={event => this.handleChange(event)}
          placeholder={this.props.placeholder}
          {...options}
        />
        <Location location={this.state.value} showTitle={false} />
      </div>
    );
  }
}

export default InputTypeLocation;
