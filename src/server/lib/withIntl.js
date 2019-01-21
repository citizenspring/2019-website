import React from 'react';
import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';
import settings from '../../../settings.json';

import 'intl';
import 'intl/locale-data/jsonp/en.js'; // for old browsers without window.Intl
import { getMessages, languages } from '../intl';

const locale = settings.locale;
if (!languages.includes(locale)) {
  throw new Error(`Invalid locale ${locale}. Accepted languages are ${languages.join(', ')}`);
}
const messages = getMessages(locale);

export default Page => {
  const IntlPage = injectIntl(Page);

  return class WithIntl extends React.Component {
    static displayName = `WithIntl(${Page.displayName})`;

    render() {
      return (
        <IntlProvider locale={locale} messages={messages} initialNow={Date.now()}>
          <IntlPage {...this.props} />
        </IntlProvider>
      );
    }
  };
};
