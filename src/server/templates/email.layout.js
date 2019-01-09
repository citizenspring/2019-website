import env from '../env';
import React from 'react';
import Oy from 'oy-vey';
import { get } from 'lodash';
import settings from '../../../settings.json';

const { Table, TBody, TR, TD } = Oy;

const styles = {
  body: {
    fontFamily: 'Helvetica Neue',
    lineHeight: 1.3,
    padding: '10px',
  },
  footer: {
    background: 'rgb(249,249,249)',
    color: 'black',
    width: '100%',
    fontFamily: 'Helvetica Neue',
    fontSize: '12px',
    marginTop: '3rem',
    padding: '3px',
    textDecoration: 'none',
    height: '28px',
    lineHeight: '28px',
  },
  footerLink: {
    textDecoration: 'none',
    color: 'black',
  },
  oclogo: {
    backgroundImage: `url('${env.BASE_URL}/static/images/opencollectiveicon-48x48@2x.png')`,
    backgroundSize: '22px 22px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
  },
};

const layout = ({ children, data }) => {
  return (
    <Table width="100%" maxwidth="600px">
      <TBody>
        <TR>
          <TD colSpan={5} style={styles.body}>
            {children}
          </TD>
        </TR>
        <TR>
          <TD colSpan={5} height={30}>
            {' '}
          </TD>
        </TR>
        <TR style={styles.footer}>
          <TD width={5} />
          <TD width={28} style={styles.oclogo} />
          <TD align="left">
            {data.url && (
              <a style={styles.footerLink} href={data.url}>
                {data.url.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            )}
            {!data.url && (
              <a style={styles.footerLink} href={env.BASE_URL}>
                {get(settings, 'name')}
              </a>
            )}
          </TD>
          <TD align="right">
            <Table>
              <TBody>
                <TR>
                  {data.subscribe && (
                    <TD>
                      <a style={styles.footerLink} href={data.subscribe.url}>
                        {data.subscribe.label}
                      </a>
                    </TD>
                  )}
                  {data.unsubscribe && (
                    <TD>
                      <a style={styles.footerLink} href={data.unsubscribe.url}>
                        {data.unsubscribe.label}
                      </a>
                    </TD>
                  )}
                </TR>
              </TBody>
            </Table>
          </TD>
          <TD width={5} />
        </TR>
      </TBody>
    </Table>
  );
};

export default layout;
