import React from 'react';
import Layout from './email.layout';
import { Table, TBody, TR, TD } from 'oy-vey';
import { FormattedMessage } from 'react-intl';
import withIntl from '../lib/withIntl';
import json2html from '../lib/json2table';

const styles = {
  btn: {
    display: 'block',
    maxWidth: '240px',
    borderRadius: '16px',
    backgroundColor: '#3399FF',
    color: 'white',
    textDecoration: 'none',
    padding: '5px 10px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editBox: {
    border: '1px solid #aaa',
    borderRadius: '3px',
    color: '#222',
    padding: '5px',
    margin: '20px',
  },
};
styles.secondBtn = {
  ...styles.btn,
  backgroundColor: 'white',
  border: '1px solid',
  borderColor: '#DCDEE0',
  borderRadius: '100px',
  color: '#76777A',
};
export const subject = ({ type }) => {
  return `please approve edit to ${type}`;
};
export const text = ({ user, type, currentVersion, newVersion, approveUrl, alwaysApproveUrl }) => {
  return `${user.name} has edited the ${currentVersion.type.toLowerCase()} "${
    currentVersion.title
  }". Please review the changes below and approve or ignore.

Current ${type} title: ${currentVersion.title}  
Current text:
${currentVersion.text}

New ${type} title: ${newVersion.title}
New text:
${newVersion.text}

To approve this change, click on this link:
${approveUrl}

To always approve changes made by ${user.name}, click on this link:
${alwaysApproveUrl}
`;
};
export const body = withIntl(data => {
  const { user, currentVersion, newVersion, approveUrl, alwaysApproveUrl } = data;
  return (
    <Layout data={data}>
      <p>
        <FormattedMessage
          id="emails.approveEdit.userHadEdited"
          values={{ user: user.name, title: currentVersion.title }}
          defaultMessage="{user} has edited"
        />{' '}
        {currentVersion.type === 'POST' && (
          <FormattedMessage id="emails.approveEdit.type.post" defaultMessage="the post" />
        )}
        {currentVersion.type === 'EVENT' && (
          <FormattedMessage id="emails.approveEdit.type.event" defaultMessage="the event" />
        )}
        {currentVersion.type === 'GROUP' && (
          <FormattedMessage id="emails.approveEdit.type.group" defaultMessage="the group" />
        )}
        {'  '}"{currentVersion.title}"
        <FormattedMessage
          id="emails.approveEdit.pleaseReview"
          values={{ user: user.name, title: currentVersion.title }}
          defaultMessage="Please review the changes below and approve or ignore."
        />
        />
      </p>
      <div style={styles.editBox}>
        <Table>
          <TBody>
            <TR>
              <TD>
                <b>
                  <FormattedMessage id="emails.approveEdit.currentVersion.title" defaultMessage="current" />
                </b>
              </TD>
              <TD>&nbsp;→&nbsp;</TD>
              <TD>
                <b>
                  <FormattedMessage id="emails.approveEdit.newVersion.title" defaultMessage="proposed change" />
                </b>
              </TD>
            </TR>
            <TR>
              <TD>
                <h2>{currentVersion.title}</h2>
                <p dangerouslySetInnerHTML={{ __html: currentVersion.html }} />
              </TD>
              <TD>&nbsp;</TD>
              <TD>
                <h2>{newVersion.title}</h2>
                <p dangerouslySetInnerHTML={{ __html: newVersion.html }} />
              </TD>
            </TR>
            {newVersion.formData && (
              <TR>
                <TD>
                  <h2>
                    <FormattedMessage id="emails.approveEdit.formData.title" defaultMessage="Form data" />
                  </h2>
                  <p dangerouslySetInnerHTML={{ __html: json2html(currentVersion.formData) }} />
                </TD>
                <TD>&nbsp;</TD>
                <TD>
                  <h2>
                    <FormattedMessage
                      id="emails.approveEdit.updatedFormData.title"
                      defaultMessage="Updated form data"
                    />
                  </h2>
                  <p dangerouslySetInnerHTML={{ __html: json2html(newVersion.formData) }} />
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </div>
      <center>
        <Table>
          <TBody>
            <TR>
              <TD>
                <a style={styles.btn} href={approveUrl}>
                  <FormattedMessage id="emails.approveEdit.approveEditBtn" defaultMessage="approve edit" />
                </a>
              </TD>
              <TD>&nbsp;</TD>
              <TD>
                <a style={styles.secondBtn} href={alwaysApproveUrl}>
                  <FormattedMessage
                    id="emails.approveEdit.alwaysApproveEditBtn"
                    values={{ user: user.name }}
                    defaultMessage="always approve edits from {user}"
                  />
                </a>
              </TD>
            </TR>
          </TBody>
        </Table>
      </center>
    </Layout>
  );
});
