import fs from 'fs';
import { loginAccountApi } from '../apis/login-api.js';

class AccountManagerClass {
  constructor() {
    this.account = {};
  }

  async loginAccount(source) {
    console.log('Logging in Account ', source);
    const { token, latestTxnId, appBaseUrl } = await loginAccountApi({
      email: process.env.ACCOUNT_EMAIL,
      password: process.env.ACCOUNT_PASSWORD,
    });
    this.account = {
      token,
      latestTxnId,
      baseUrl: appBaseUrl,
    };
    fs.writeFileSync(
      process.env.SESSION_PATH,
      JSON.stringify({
        token,
        baseUrl: appBaseUrl,
      })
    );
    console.log('Account successfully logged in');
  }

  async getAccount(forceFetchToken, source) {
    if (
      !forceFetchToken &&
      this.account &&
      this.account.baseUrl &&
      this.account.token &&
      this.account.latestTxnId
    ) {
      return this.account;
    }

    await this.loginAccount(`${source} >> getAccount`);
    return this.account;
  }

  setAccount(params) {
    this.account = {
      ...this.account,
      ...params,
    };
  }
}

const AccountManager = new AccountManagerClass();

export default AccountManager;
