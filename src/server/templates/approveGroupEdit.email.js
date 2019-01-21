import React from 'react';
import Layout from './email.layout';
import { Table, TBody, TR, TD } from 'oy-vey';

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
export const subject = ({ type }) => {
  return `please approve edit to ${type}`;
};
export const text = ({ user, type, currentVersion, newVersion, approveUrl, alwaysApproveUrl }) => {
  return `${user.name} has edited the ${
    currentVersion.slug
  } ${type}. Please review the changes below and approve or ignore.

Current ${type} name: ${currentVersion.name}  
Current description:
${currentVersion.description}

New ${type} name: ${newVersion.name}
New description:
${newVersion.description}

To approve this change, click on this link:
${approveUrl}

To always approve changes made by ${user.name}, click on this link:
${alwaysApproveUrl}
`;
};
export const body = data => {
  const { user, type, currentVersion, newVersion, approveUrl, alwaysApproveUrl } = data;
  return (
    <Layout data={data}>
      <p>
        {user.name} has edited the {currentVersion.slug} ${type}. Please review the changes below and approve or ignore.
      </p>
      <div style={styles.editBox}>
        <Table>
          <TBody>
            <TR>
              <TD>
                <b>current</b>
              </TD>
              <TD>&nbsp;→&nbsp;</TD>
              <TD>
                <b>proposed change</b>
              </TD>
            </TR>
            <TR>
              <TD>
                <h2>{currentVersion.name}</h2>
                <p>{currentVersion.description}</p>
              </TD>
              <TD>&nbsp;</TD>
              <TD>
                <h2>{newVersion.name}</h2>
                <p>{newVersion.description}</p>
              </TD>
            </TR>
          </TBody>
        </Table>
      </div>
      <center>
        <a style={styles.btn} href={approveUrl}>
          approve edit
        </a>
        <a style={styles.btn} href={alwaysApproveUrl}>
          always approve edits from {user.name}
        </a>
      </center>
    </Layout>
  );
};
