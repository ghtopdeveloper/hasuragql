import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ProgressBar from 'react-progress-bar-plus';
import Notifications from 'react-notification-system-redux';
import Modal from 'react-bootstrap/lib/Modal';
import './progress-bar.scss';
import { NOTIF_EXPANDED } from './Actions';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import ErrorBoundary from './ErrorBoundary';
import UncaughtException from '../../utils/exceptions';

class App extends Component {
  componentDidMount() {
    // Hide the loader once the react component is ready.
    // NOTE: This will execute only onces (since this is parent component for all other component).
    const className = document.getElementById('content').className;
    document.getElementById('content').className = className + ' show';
    document.getElementById('loading').style.display = 'none';
  }

  onModalClose = () => {
    this.props.dispatch({ type: NOTIF_EXPANDED, data: false });
  };

  render() {
    const styles = require('./progress-bar.scss');
    const {
      requestError,
      error,
      ongoingRequest,
      percent,
      intervalTime,
      children,
      notifications,
      connectionFailed,
      isNotifExpanded,
      notifMsg,
    } = this.props;

    if (requestError && error) {
      console.error(
        'uncaught exception',
        new UncaughtException(requestError, error)
      );
    }

    const notificationStyle = {
      Containers: {
        DefaultStyle: {
          width: '400px',
          height: 'auto',
        },
      },
      NotificationItem: {
        DefaultStyle: {
          height: 'auto',
        },
        error: {
          height: 'auto',
        },
      },
    };
    if (isNotifExpanded) {
      notificationStyle.Containers.DefaultStyle.width = '800px';
    }

    let hasuraCliDown = null;
    if (connectionFailed) {
      hasuraCliDown = (
        <div
          style={{ marginBottom: '0px' }}
          className={styles.alertDanger + ' alert alert-danger'}
        >
          <strong>
            Hey there! Console is not able to reach your cluster. Please check
            if hasura console server is running. Restart and try again.
          </strong>
        </div>
      );
    }

    return (
      <ErrorBoundary>
        <div>
          {hasuraCliDown}
          {ongoingRequest && (
            <ProgressBar
              percent={percent}
              autoIncrement={true} // eslint-disable-line react/jsx-boolean-value
              intervalTime={intervalTime}
              spinner={false}
            />
          )}
          <div>{children}</div>
          <Notifications
            notifications={notifications}
            style={notificationStyle}
          />
          <Modal
            show={isNotifExpanded}
            onHide={this.onModalClose}
            dialogClassName={styles.notifModalDialog}
          >
            <Modal.Header closeButton>
              <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="content-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <AceEditor
                      mode="json"
                      theme="github"
                      name="notif_error"
                      value={notifMsg}
                      minLines={8}
                      maxLines={100}
                      width="100%"
                      showPrintMargin={false}
                    />
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </ErrorBoundary>
    );
  }
}

App.propTypes = {
  reqURL: PropTypes.string,
  reqData: PropTypes.object,
  statusCode: PropTypes.number,

  modalOpen: PropTypes.bool,
  error: PropTypes.object,
  ongoingRequest: PropTypes.bool,
  requestError: PropTypes.bool,
  connectionFailed: PropTypes.bool,

  intervalTime: PropTypes.number,
  percent: PropTypes.number,

  children: PropTypes.element,
  dispatch: PropTypes.func.isRequired,

  notifications: PropTypes.array,
  isNotifExpanded: PropTypes.bool,
  notifMsg: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    ...state.progressBar,
    notifications: state.notifications,
  };
};

export default connect(mapStateToProps)(App);
