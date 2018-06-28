import React from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { appPrefix } from '../push';

const TableHeader = ({
  tableName,
  tableComment,
  tabName,
  count,
  migrationMode,
  currentSchema,
}) => {
  const styles = require('./Table.scss');
  let capitalised = tabName;
  capitalised = capitalised[0].toUpperCase() + capitalised.slice(1);
  let showCount = '';
  if (!(count === null || count === undefined)) {
    showCount = '(' + count + ')';
  }
  const commentText = tableComment ? tableComment.result[1] : null;
  let commentHtml = null;
  if (commentText) {
    commentHtml = (
      <div className={styles.commentText + ' alert alert-warning'}>
        {commentText}
      </div>
    );
  }
  let activeTab;
  if (tabName === 'view') {
    activeTab = 'Browse Rows';
  } else if (tabName === 'insert') {
    activeTab = 'Insert Row';
  } else if (tabName === 'modify') {
    activeTab = 'Modify';
  } else if (tabName === 'relationships') {
    activeTab = 'Relationships';
  } else if (tabName === 'permissions') {
    activeTab = 'Permissions';
  }
  return (
    <div>
      <Helmet title={capitalised + ' - ' + tableName + ' - Data | Hasura'} />
      <div className={styles.subHeader}>
        <div className={styles.dataBreadCrumb}>
          You are here: <Link to={'/data/schema/' + currentSchema}>Data</Link>{' '}
          <i className="fa fa-angle-right" aria-hidden="true" />{' '}
          <Link to={'/data/schema/' + currentSchema}>Schema</Link>{' '}
          <i className="fa fa-angle-right" aria-hidden="true" />{' '}
          <Link to={'/data/schema/' + currentSchema}>{currentSchema}</Link>{' '}
          <i className="fa fa-angle-right" aria-hidden="true" />{' '}
          <Link
            to={
              '/data/schema/' +
              currentSchema +
              '/tables/' +
              tableName +
              '/browse'
            }
          >
            {tableName}
          </Link>{' '}
          <i className="fa fa-angle-right" aria-hidden="true" /> {activeTab}
        </div>
        <h2 className={styles.heading_text}>{tableName}</h2>
        <div className={styles.nav}>
          <ul className="nav nav-pills">
            <li
              role="presentation"
              className={tabName === 'view' ? styles.active : ''}
              data-test="table-browse-rows"
            >
              <Link
                to={
                  appPrefix +
                  '/schema/' +
                  currentSchema +
                  '/tables/' +
                  tableName +
                  '/browse'
                }
              >
                Browse Rows {showCount}
              </Link>
            </li>
            <li
              role="presentation"
              className={tabName === 'insert' ? styles.active : ''}
              data-test="table-insert-rows"
            >
              <Link
                to={
                  appPrefix +
                  '/schema/' +
                  currentSchema +
                  '/tables/' +
                  tableName +
                  '/insert'
                }
              >
                Insert Row
              </Link>
            </li>
            {migrationMode ? (
              <li
                role="presentation"
                className={tabName === 'modify' ? styles.active : ''}
                data-test="table-modify"
              >
                <Link
                  to={
                    appPrefix +
                    '/schema/' +
                    currentSchema +
                    '/tables/' +
                    tableName +
                    '/modify'
                  }
                >
                  Modify
                </Link>
              </li>
            ) : null}
            <li
              role="presentation"
              className={tabName === 'relationships' ? styles.active : ''}
              data-test="table-relationships"
            >
              <Link
                to={
                  appPrefix +
                  '/schema/' +
                  currentSchema +
                  '/tables/' +
                  tableName +
                  '/relationships'
                }
              >
                Relationships
              </Link>
            </li>
            <li
              role="presentation"
              className={tabName === 'permissions' ? styles.active : ''}
              data-test="table-permissions"
            >
              <Link
                to={
                  appPrefix +
                  '/schema/' +
                  currentSchema +
                  '/tables/' +
                  tableName +
                  '/permissions'
                }
              >
                Permissions
              </Link>
            </li>
            <li role="presentation" className={'hide'}>
              <Link
                to={
                  appPrefix +
                  '/schema/' +
                  currentSchema +
                  '/tables/' +
                  tableName +
                  '/permissions'
                }
              >
                <button className="btn btn-xs btn-warning">Try out APIs</button>
              </Link>
            </li>
          </ul>
        </div>
        <div className="clearfix" />
      </div>
      <div>{commentHtml}</div>
    </div>
  );
};
export default TableHeader;
