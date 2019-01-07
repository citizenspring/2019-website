import React from 'react';
import Layout from './email.layout';

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

export const body = data => {
  const { user, group, confirmationUrl } = data;
  return (
    <Layout data={data}>
      <p>
        {user.name} has edited the {group.slug} group. Please review the changes below and approve or ignore.
      </p>
      <div style={styles.editBox}>
        <h2>{group.title}</h2>
        <p>{group.description}</p>
      </div>
      <center>
        <a style={styles.btn} href={confirmationUrl}>
          approve edit
        </a>
      </center>
    </Layout>
  );
};
