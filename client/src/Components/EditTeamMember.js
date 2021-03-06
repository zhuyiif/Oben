import React from 'react';
import axios from 'axios';

import EmployeeList from './EmployeeList';
import '../CSS/EditTeamMember.css';
import '../CSS/bootstrap/css/bootstrap-iso.css';
import AddCircle from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import { thisTypeAnnotation } from '@babel/types';

class EditTeamMember extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedemployee: null,
      selectedemployeeid: null,
      newTeamName: '',
      teams: [''],
      team: '',
      job_title: '',
      supervisor: '',
      start_date: '',
      work_email: '',
      phone: '',
      contract_file: null,
      contract_filename: '',
      contract_encoded_filename: '',
      w9_file: null,
      w9_filename: '',
      w9_encoded_filename: '',
      contract_expire_date: '',
      payment_method: 'check',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      rate: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleRadioSelect = this.handleRadioSelect.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCreateTeam = this.handleCreateTeam.bind(this);
    this.doContractfileupload = this.doContractfileupload.bind(this);
    this.dow9fileupload = this.dow9fileupload.bind(this);
    this.handleDeleteTeam = this.handleDeleteTeam.bind(this);
  }

  componentDidMount() {
    const config = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      }
    };
    const url = process.env.REACT_APP_API_ENDPOINT + '/api/team/getAll';
    axios.get(url, config).then(
      res => {
        let teams = res.data.teams;
        this.setState({
          teams: teams
        });
      },
      error => {
        console.log(error);
      }
    );
  }
  handleSelect(item) {
    console.log(this.state.w9_file);
    this.setState({
      selectedemployee: item,
      selectedemployeeid: item._id,
      team: item.team_name
    });
  }

  handleChange(e) {
    let value = e.target.value;
    let name = e.target.name;
    this.setState({
      [name]: value
    });
  }

  handleFileChange(e) {
    if (e.target.name === 'contract') {
      this.setState({
        contract_file: e.target.files[0],
        contract_filename: e.target.files[0].name
      });
    } else {
      this.setState({
        w9_file: e.target.files[0],
        w9_filename: e.target.files[0].name
      });
    }
  }

  handleRadioSelect(value) {
    this.setState({ payment_method: value });
  }

  handleCreateTeam() {
    const configpost = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      }
    };
    if (this.state.newTeamName === '') {
      alert('You could not create a team with empty name!!!');
      return;
    }
    const param = {
      team_name: this.state.newTeamName
    };
    let url = process.env.REACT_APP_API_ENDPOINT + '/api/team/create';
    axios
      .post(url, param, configpost)
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          this.setState({ teams: [...this.state.teams, res.data.teamcreated] });
        }
      })
      .catch(e => {
        console.log(e);
        console.log('Team Creating failed');
      });
  }
  handleDeleteTeam(team_name) {
    console.log('teamname', team_name);
    const config = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      },
      data: {
        team_name: team_name
      }
    };

    let url = process.env.REACT_APP_API_ENDPOINT + '/api/team/';
    axios
      .delete(url, config)
      .then(res => {
        if (res.status === 200) {
          const filteredItems = this.state.teams.filter(
            team => team.team_name !== team_name
          );
          this.setState({ teams: [...filteredItems] });
        }
      })
      .catch(() => {
        console.log('Team deleting failed');
      });
  }

  handleSave() {
    console.log(this.state);
    const temp = {
      method: this.state.payment_method,
      address: this.state.address,
      address2: this.state.address2,
      city: this.state.city,
      state: this.state.state,
      zip: this.state.zip,
      rate: this.state.rate
    };
    let teamid = null;
    if (
      this.state.teams.filter(team => team.team_name === this.state.team)
        .length === 1
    ) {
      teamid = this.state.teams.filter(
        team => team.team_name === this.state.team
      )[0]._id;
    }
    let param = null;
    if(this.state.selectedemployee.user_type === 'employee'){
        param = {
            _id: this.state.selectedemployeeid,
            job_title: this.state.job_title,
            team: teamid,
            start_date: this.state.start_date,
            work_email: this.state.work_email,
            phone: this.state.phone,
            payment: temp,
            contract_on_file: this.state.contract_encoded_filename,
            w4: this.state.w9_encoded_filename,
            supervisor: this.state.supervisor,
            contract_expiration: this.state.contract_expire_date
        };
    }else{
        param = {
            _id: this.state.selectedemployeeid,
            job_title: this.state.job_title,
            team: teamid,
            start_date: this.state.start_date,
            work_email: this.state.work_email,
            phone: this.state.phone,
            payment: temp,
            contract_on_file: this.state.contract_encoded_filename,
            w9: this.state.w9_encoded_filename,
            supervisor: this.state.supervisor,
            contract_expiration: this.state.contract_expire_date
        };
    }
    
    console.log('============CHECK!!!!================');
    console.log(param);
    console.log('====================================');

    const configpost = {
      headers: {
        authorization: 'Bearer ' + sessionStorage.getItem('token')
      }
    };
    const url = process.env.REACT_APP_API_ENDPOINT + '/api/user/userInfoById';
    axios
      .put(url, param, configpost)
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          alert('Succeed in updating info');
          window.location.reload();
        }
      })
      .catch(e => {
        console.log(e);
        console.log('Update Info failed');
      });
  }

  doContractfileupload() {
    if (this.state.contract_file != null) {
      const configpost = {
        headers: {
          authorization: 'Bearer ' + sessionStorage.getItem('token')
        }
      };
      const param = new FormData();
      param.append('file', this.state.contract_file);
      let fname = this.state.contract_filename;
      let url = process.env.REACT_APP_API_ENDPOINT + '/api/file/upload';
      axios
        .post(url, param, configpost)
        .then(res => {
          console.log(res);
          if (res.status === 200) {
            alert('Succeeded in Uploading Contract files!');
            this.setState(
              {
                contract_encoded_filename: res.data.filename
              },
              () => this.dow9fileupload()
            );
          }
        })
        .catch(e => {
          console.log(e);
          console.log('Upload files failed');
        });
    } else {
      this.dow9fileupload();
    }
  }

  dow9fileupload() {
    if (this.state.w9_file != null) {
      const configpost = {
        headers: {
          authorization: 'Bearer ' + sessionStorage.getItem('token')
        }
      };
      const param = new FormData();
      param.append('file', this.state.w9_file);
      let fname = this.state.w9_filename;
      let url = process.env.REACT_APP_API_ENDPOINT + '/api/file/upload';
      axios
        .post(url, param, configpost)
        .then(res => {
          console.log(res);
          if (res.status === 200) {
            alert('Succeeded in Uploading W9 files!');
            this.setState(
              {
                w9_encoded_filename: res.data.filename
              },
              () => this.handleSave()
            );
          }
        })
        .catch(() => {
          console.log('Upload files failed');
        });
    } else {
      this.handleSave();
    }
  }

  render() {
    return (
      <div class='canvas'>
        <div className='title'>Create Team Names</div>
        <div className='teams_wrapper'>
          {this.state.teams.map(team => (
            <div>
              <button className='teamName btn' key={team.team_name}>
                {team.team_name}
              </button>
              <IconButton aria-label='delete' size='small'>
                <Delete
                  color='primary'
                  fontSize='inherit'
                  onClick={this.handleDeleteTeam.bind(this, team.team_name)}
                />
              </IconButton>
            </div>
          ))}
          <div>
            <input
              type='text'
              placeholder='new team name'
              value={this.state.newTeamName}
              name='newTeamName'
              onChange={this.handleChange}
            />
          </div>
          <div>
            <IconButton aria-label='delete' size='small'>
              {' '}
              <AddCircle
                color='primary'
                fontSize='inherit'
                onClick={this.handleCreateTeam}
              />
            </IconButton>
          </div>
        </div>
        <div class='employeeList'>
          <p style={{ color: 'black', textAlign:'center'}}>
            Name of Employee
          </p>
          <div class='ListWrapper'>
            <EmployeeList selectCallback={this.handleSelect} />
          </div>
        </div>
        {this.state.selectedemployee == null ? (
          <div className='noSectionBox3'>
            <div className='banner3'>Select Team Member to Edit</div>
          </div>
        ) : (
          <form>
            <div id='container'>
              <div className='nested'>
                <div className='title'>{this.state.selectedemployee.first_name + " " + this.state.selectedemployee.last_name +"'s Information"}</div>
                <div className='input'>
                  <div>
                    <label>Team</label>
                  </div>
                  <div>
                    <td>
                      <select
                        class='select'
                        onChange={this.handleChange}
                        name='team'
                        value={this.state.team}
                      >
                        {this.state.teams.map(team => (
                          <option value={team.team_name}>
                            {team.team_name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Job Title</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.job_title}
                      onChange={this.handleChange}
                      name='job_title'
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Supervisor</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.supervisor}
                      onChange={this.handleChange}
                      name='supervisor'
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Start Date</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.start_date}
                      onChange={this.handleChange}
                      name='start_date'
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Work Email</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.work_email}
                      onChange={this.handleChange}
                      name='work_email'
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Phone</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.phone}
                      onChange={this.handleChange}
                      name='phone'
                    />
                  </div>
                </div>
                <div className='title'>Contract Agreement</div>
                <div className='input'>
                  <div>
                    <label>Contract on file</label>
                  </div>
                  <div>
                    <input
                      type='file'
                      name='contract'
                      onChange={this.handleFileChange}
                    />
                  </div>
                </div>
              </div>
              <div className='nested'>
                <div className='title'>Contract Status</div>
                <div className='input'>
                  <div>
                        <label>{this.state.selectedemployee.user_type==='employee'?'W4 On File':'W9 On File'}</label>
                  </div>
                  <div>
                    <input
                      type='file'
                      name='w9'
                      onChange={this.handleFileChange}
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Contract Expire Date</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.contract_expire_date}
                      name='contract_expire_date'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className='title'>Payment Information</div>
                <div className='input'>
                  <div>
                    <label>Method</label>
                  </div>
                  <RadioGroup
                    style={{
                      height: '40px',
                      display: 'inline-flex',
                      width: '100%'
                    }}
                    value={this.state.payment_method}
                    onChange={this.handleRadioSelect}
                    horizontal
                  >
                    <RadioButton className='radio' value='check'>
                      Check
                    </RadioButton>
                    <RadioButton className='radio' value='ACH'>
                      ACH
                    </RadioButton>
                  </RadioGroup>
                </div>
                <div className='input'>
                  <div>
                    <label>Address</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.address}
                      name='address'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Address 2</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.address2}
                      name='address2'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>City</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.city}
                      name='city'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>State</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.state}
                      name='state'
                      onChange={this.handleChange}
                    />
                  </div>
                  <div>
                    <label>Zip</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.zip}
                      name='zip'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className='input'>
                  <div>
                    <label>Rate Information</label>
                  </div>
                  <div>
                    <input
                      type='text'
                      value={this.state.rate}
                      name='rate'
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className='single_box' style={{ background: '#eee' }}>
                <div className='form-group' style={{ witdh: 'inherit' }}>
                  <div className='bootstrap-iso'>
                    <button
                      type='button'
                      className='btn btn-success inlineButton'
                      onClick={this.doContractfileupload}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default EditTeamMember;
