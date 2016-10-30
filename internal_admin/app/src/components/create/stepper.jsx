// Modules
import React from 'react';
import * as request from 'superagent';
import { userUrl } from '../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
const stepperContainerStyle = {width: '100%', maxWidth: 900, margin: 'auto'};
const contentStyle = {margin: '0 16px'};
const buttonContainerStyle = {
  marginTop: 12,
  textAlign: 'center'
};
const backButtonStyle = { marginRight: 12 };

// Components
import CompanyCreation from './company/companyCreation';
import UserCreation from './user/userCreation';
import InfoConfirm from './user/infoConfirm';
import userCreateRedux from '../../reduxes/userCreation';

export default class CreationStepper extends React.Component {
  constructor() {
    super();
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.getStepContent = this.getStepContent.bind(this);
    this.onClickReset = this.onClickReset.bind(this);
    this.state = {
      finished: false,
      stepIndex: 0,
    };
  }

  handleNext() {
    const { stepIndex } = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
    const curStepIdx = this.state.stepIndex;
    if (curStepIdx === 2) {
      // Make ajax call to create user
      request
      .post(userUrl)
      .send(userCreateRedux.getState())
      .withCredentials()
      .end(err => {
        if (err) {
          console.error(err);
        } else {
          userCreateRedux.dispatch({ type: 'CREATED' });
          console.log(userCreateRedux.getState());
        }
      });
    }
  }

  handlePrev() {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  }

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <CompanyCreation />;
      case 1:
        return <UserCreation />;
      case 2:
        return <InfoConfirm />;
      default:
        return 'Done';
    }
  }

  onClickReset(event) {
    event.preventDefault();
    this.setState({stepIndex: 0, finished: false});
  }

  render() {
    const { finished, stepIndex } = this.state;

    return (
      <div style={ stepperContainerStyle }>
        <Row>
          <Stepper activeStep={ stepIndex }>
            <Step>
              <StepLabel>Select/Create a company</StepLabel>
            </Step>
            <Step>
              <StepLabel>Create a user</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm the user and company information</StepLabel>
            </Step>
          </Stepper>
        </Row>

        <Row>
          <div style={ contentStyle }>
            {finished ? (
              <h3>New User Created</h3>
            ) : (
              <div>
                <Row>{ this.getStepContent(stepIndex) }</Row>
                <Row>
                  <div style={ buttonContainerStyle }>
                    <FlatButton label='Back' disabled={ stepIndex === 0 } onClick={ this.handlePrev } style={ backButtonStyle } />
                    <RaisedButton label={ stepIndex === 2 ? 'Finish' : 'Next' } primary={ true } onClick={ this.handleNext } />
                  </div>
                </Row>
              </div>
            )}
          </div>
        </Row>
      </div>
    );
  }
}
