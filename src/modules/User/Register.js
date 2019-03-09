import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, Select, Row, Col, Popover, Progress } from 'antd';
import './Register.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: <div className={'success'}>强度：强</div>,
  pass: <div className={'warning'}>强度：中</div>,
  poor: <div className={'error'}>强度：太短</div>
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception'
};

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/submit']
}))
@Form.create()
export default class Register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86'
  };

  componentWillReceiveProps(nextProps) {
    const account = this.props.form.getFieldValue('mail');
    if (nextProps.register.status === 'ok') {
      this.props.dispatch(
        routerRedux.push({
          pathname: '/user/register-result',
          state: {
            account
          }
        })
      );
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'register/submit',
          payload: {
            ...values,
            prefix: this.state.prefix
          },
          callback: () => {
            this.props.dispatch(routerRedux.push('/about'));
          }
        });
      }
    });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('user_pass')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  checkPassword = (rule, value, callback) => {
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value
      });
      callback('error');
    } else {
      this.setState({
        help: ''
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  changePrefix = value => {
    this.setState({
      prefix: value
    });
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={`progress-${passwordStatus}`}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={'progress'}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, prefix } = this.state;
    return (
      <div className={'main'}>
        <h3>注册</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            {getFieldDecorator('user_email', {
              rules: [
                {
                  required: true,
                  message: '请输入邮箱地址！'
                },
                {
                  type: 'email',
                  message: '邮箱地址格式错误！'
                }
              ]
            })(<Input size="large" placeholder="邮箱" />)}
          </FormItem>
          <FormItem>
            {getFieldDecorator('user_name', {
              rules: [
                {
                  required: true,
                  message: '请输入用户名'
                },
                {
                  pattern: /[a-zA-Z]\w{5,11}/,
                  message: '用户名格式错误！首字符为字母，6到12字母或数字'
                }
              ]
            })(<Input size="large" placeholder="用户名" />)}
          </FormItem>
          <FormItem help={this.state.help}>
            <Popover
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    请至少输入 6 个字符。请不要使用容易被猜到的密码。
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={this.state.visible}
            >
              {getFieldDecorator('user_pass', {
                rules: [
                  {
                    validator: this.checkPassword
                  }
                ]
              })(<Input size="large" type="password" placeholder="至少6位密码，区分大小写" />)}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('comfirm_pass', {
              rules: [
                {
                  required: true,
                  message: '请确认密码！'
                },
                {
                  validator: this.checkConfirm
                }
              ]
            })(<Input size="large" type="password" placeholder="确认密码" />)}
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={'submit'}
              type="primary"
              htmlType="submit"
            >
              注册
            </Button>
            <Link className={'login'} to="/user/login">
              使用已有账户登录
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
