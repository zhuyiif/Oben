import React from 'react';
import { Table, Row, Col, Form } from 'react-bootstrap';
import SubmissionRow from '../Components/SubmissionRow';
import moment from 'moment';
import axios from 'axios';
import '../CSS/Home.css';
import '../CSS/SubmissionTable.css';
import '../CSS/bootstrap/css/bootstrap-iso.css';

class ApprovalTable extends React.Component {
  constructor(props) {
    super(props);
    this.returnMessage = React.createRef();

    this.getWeeklyDateAmount = this.getWeeklyDateAmount.bind(this);
    this.getTotalAmount = this.getTotalAmount.bind(this);
    this.approve = this.approve.bind(this);
    this.returnSub = this.returnSub.bind(this);
  }

  approve(id) {
    const param = {
      _id: id
    };
    const config = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      }
    };
    const url = process.env.REACT_APP_API_ENDPOINT + "/api/submission/approve";
    axios
      .put(url,param,config)
      .then((res)=>{
        console.log(res)
        if(res.status === 200){
          this.props.onProcess();
          this.props.selectedSubmission.status = 'accepted';
        }
      })
      .catch(e => {
        console.log(e);
        console.log('Approval failed');
      });
  }

  returnSub(id) {
    const message = this.returnMessage.current.value;
    const param = {
      _id: id,
      note: message
    };
    const config = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      }
    };
    const url = process.env.REACT_APP_API_ENDPOINT + "/api/submission/return";
    axios
      .put(url,param,config)
      .then((res)=>{
        if(res.status === 200){
          this.props.onProcess();
          this.props.selectedSubmission.status = 'returned';
          this.props.selectedSubmission.note = message;
        }
      })
      .catch(e => {
        console.log(e);
        console.log('Failed to return');
      });
  }

  getWeeklyDateAmount(submittedDateAmount, firstDayofWeek) {
    let weeklyDateAmount = [0, 0, 0, 0, 0, 0, 0];
    submittedDateAmount.forEach(entry => {
      weeklyDateAmount[moment(entry.date).diff(firstDayofWeek, 'days')] =
        entry.amount;
    });
    return weeklyDateAmount;
  }

  getTotalAmount(submittedTotalAmount, firstDayofWeek){
    let weeklyTotalAmount = [0, 0, 0, 0, 0, 0, 0];
    submittedTotalAmount.forEach(
      entry =>
        (weeklyTotalAmount[moment(entry.date).diff(firstDayofWeek, 'days')] =
          entry.amount)
    );
    return weeklyTotalAmount;
  }

  render() {
    // const ticket_numbers = [1];
    let tableType, status, id, input, total_amount, firstDay, allDays, note;

    if (this.props.selectedSubmission !== 'noselection') {
      tableType = this.props.selectedSubmission.type;
      status = this.props.selectedSubmission.status;
      id = this.props.selectedSubmission._id;
      input = this.props.selectedSubmission.input;
      firstDay = moment(input[0].dateAmount[0].date).startOf('week');
      let currDay = moment(firstDay);
      allDays = [<td className='date'>{currDay.date()}</td>];
      for (let i = 0; i < 6; ++i) {
        allDays.push(<td className='date'>{currDay.add(1, 'day').date()}</td>);
      }
      total_amount = this.getTotalAmount(this.props.selectedSubmission.total_amount,firstDay);
      note = this.props.selectedSubmission.note;
    }

    const actionRow = (
      <div className='return_message'>
        <div>Return Message</div>
        <div className='column-1'>
          <Form.Control placeholder='return message' ref={this.returnMessage} />
        </div>
        <div>
          <button
            type='button'
            className='btn btn-success col'
            onClick={() => this.approve(id)}
          >
            Approve
          </button>
          <button
            type='button'
            className='btn btn-danger col'
            onClick={() => this.returnSub(id)}
          >
            Return
          </button>
        </div>
      </div>
    );

    const approvedBanner = (
      <div className='submit_button'>
        <Row>
          <Col lg={{span: 8}}/>
          <Col md={{span:3}}/>
          <Col>
            <h4><span className='badge badge-success col'>Submission Approved</span></h4>
          </Col>
        </Row>
      </div>);

    const returnedBanner = (
      <div className='wrapper-right'>
        <div>Message: </div>
        <div className='column-2'>{note}</div>
        <div>
          <h4>
            <span className='badge badge-success col'>Submission Returned</span>
          </h4>
        </div>
      </div>
    );

    const noSelection = (
      <div className='noSectionBox2'>
          <div className='banner2'>Select Submission to Approve or Return</div>
      </div>
    );

    return (
          this.props.selectedSubmission !== 'noselection' ? (
            <div class='right_content'>
            {tableType === 'time' && (
              <div className='outer_box'>
                <span style={{ color: '#4651af' }}>
                  {this.props.page === 'submission' ? `Your Submission on ${moment().format('MMMM DD, YYYY')}`
                  :'Time Sheet Approval'
                  }
                </span>

                <div class='submissionSection bootstrap-iso'>
                  <Table bordered>
                    <thead>
                      <tr>
                        <td className='information'>Ticket ID</td>
                        <td className='information'>Project</td>
                        {allDays}
                      </tr>
                    </thead>
                    <tbody>
                      {input.map((ipt, idx) => (
                        <SubmissionRow
                          ticket_number={idx + 1}
                          key={idx + 1}
                          viewOnly={true}
                          projectName={ipt.project_name}
                          weeklyDateAmount={this.getWeeklyDateAmount(
                            ipt.dateAmount,
                            firstDay
                          )}
                        />
                      ))}
                      <tr>
                        <td></td>
                        <td>Total Hour</td>
                        <td>{total_amount[0]}</td>
                        <td>{total_amount[1]}</td>
                        <td>{total_amount[2]}</td>
                        <td>{total_amount[3]}</td>
                        <td>{total_amount[4]}</td>
                        <td>{total_amount[5]}</td>
                        <td>{total_amount[6]}</td>
                      </tr>
                    </tbody>
                  </Table>
                  {status === 'pending' && this.props.page !== 'submission' && actionRow}
                  {status === 'accepted' && approvedBanner}
                  {status == 'returned' && returnedBanner}
                </div>
              </div>
            )}
            {tableType === 'expense' && (
              <div className='outer_box'>
                <span style={{ color: '#4651af' }}>
                  {this.props.page === 'submission' ? `Your Submission on ${moment().format('MMMM DD, YYYY')}`
                  :'Expense Approval'
                  }
                </span>

                <div className='submissionSection bootstrap-iso'>
                  <Table bordered>
                    <thead>
                      <tr>
                        <td className='information'>Ticket ID</td>
                        <td className='information'>Project</td>
                        {allDays}
                      </tr>
                    </thead>
                    <tbody>
                      {input.map((ipt, idx) => (
                        <SubmissionRow
                          ticket_number={idx + 1}
                          key={idx + 1}
                          viewOnly={true}
                          projectName={ipt.project_name}
                          weeklyDateAmount={this.getWeeklyDateAmount(
                            ipt.dateAmount,
                            firstDay
                          )}
                        />
                      ))}
                      <tr>
                        <td></td>
                        <td>Total Expense</td>
                        <td>
                          {total_amount[0] == 0 ? '' : `$${total_amount[0]}`}
                        </td>
                        <td>
                          {total_amount[1] == 0 ? '' : `$${total_amount[1]}`}
                        </td>
                        <td>
                          {total_amount[2] == 0 ? '' : `$${total_amount[2]}`}
                        </td>
                        <td>
                          {total_amount[3] == 0 ? '' : `$${total_amount[3]}`}
                        </td>
                        <td>
                          {total_amount[4] == 0 ? '' : `$${total_amount[4]}`}
                        </td>
                        <td>
                          {total_amount[5] == 0 ? '' : `$${total_amount[5]}`}
                        </td>
                        <td>
                          {total_amount[6] == 0 ? '' : `$${total_amount[6]}`}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  {status === 'pending' && this.props.page !== 'submission' && actionRow}
                  {status === 'accepted' && approvedBanner}
                  {status == 'returned' && returnedBanner}
                </div>
              </div>
            )}
            {tableType === 'invoice' && (
              <div className='outer_box'>
                <span style={{ color: '#4651af' }}>Invoice Approval</span>
                <div className='submissionSection bootstrap-iso'>
                  <form className='form-inline'>
                    <div className='form-group row col-sm-6'>
                      <label htmlFor='month' className='col-sm-3 col-form-label '>
                        Month
                      </label>
                      <div className='col-sm-3'>
                        <input
                          type='text'
                          className='form-control small-input'
                          id='month'
                        />
                      </div>
                    </div>
                    <div className='form-group row col-sm-6'>
                      <label
                        htmlFor='invoice_no'
                        className='col-sm-4 col-form-label'
                      >
                        Invoice Number
                      </label>
                      <div className='col-sm-2'>
                        <input
                          type='text'
                          className='form-control small-input'
                          id='invoice_no'
                        />
                      </div>
                    </div>
                    <div className='form-group row'>
                      <label
                        htmlFor='total_days'
                        className='col-sm-6 col-form-label'
                      >
                        Total Days in the invoice:
                      </label>
                      <input
                        type='text'
                        className='form-control col-sm-6'
                        id='total_dyas'
                      />
                    </div>

                    <div className='form-group row'>
                      <label
                        htmlFor='total_amount'
                        className='col-sm-6 col-form-label'
                      >
                        Total Amount Submitted:
                      </label>
                      <input
                        type='text'
                        className='form-control col-sm-6'
                        id='total_amount'
                      />
                    </div>

                    <div className='form-group row'>
                      <label
                        htmlFor='service'
                        className='col-sm-6 col-form-label'
                      >
                        Nature of Services Provided:
                      </label>
                      <input
                        type='text'
                        className='form-control col-sm-6'
                        id='service'
                      />
                    </div>
                  </form>
                  {actionRow}
                </div>
              </div>
            )}
          </div>
        ): noSelection
    );
  }
}

export default ApprovalTable;
