import React from 'react';
import Layout from './email.layout';
import { Table, TBody, TR, TD } from 'oy-vey';
import { FormattedMessage } from 'react-intl';
import withIntl from '../lib/withIntl';

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
  return `${user.name} has edited the post "${
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
          id="emails.approvePostEdit.firstLine"
          values={{ user: user.name, title: currentVersion.title }}
          defaultMessage='{user} has edited the post "{title}". Please review the changes below and approve or ignore.'
        />
      </p>
      <div style={styles.editBox}>
        <Table>
          <TBody>
            <TR>
              <TD>
                <b>
                  <FormattedMessage id="emails.approvePostEdit.currentVersion.title" defaultMessage="current" />
                </b>
              </TD>
              <TD>&nbsp;→&nbsp;</TD>
              <TD>
                <b>
                  <FormattedMessage id="emails.approvePostEdit.newVersion.title" defaultMessage="proposed change" />
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
          </TBody>
        </Table>
      </div>
      <center>
        <Table>
          <TBody>
            <TR>
              <TD>
                <a style={styles.btn} href={approveUrl}>
                  <FormattedMessage id="emails.approvePostEdit.approveEditBtn" defaultMessage="approve edit" />
                </a>
              </TD>
              <TD>&nbsp;</TD>
              <TD>
                <a style={styles.secondBtn} href={alwaysApproveUrl}>
                  <FormattedMessage
                    id="emails.approvePostEdit.alwaysApproveEditBtn"
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
