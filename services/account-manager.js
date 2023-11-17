import { loginAccountApi } from '../apis/login-api.js';

class AccountManagerClass {
  constructor() {
    this.account = {};
  }

  async loginAccount() {
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
        baseUrl,
      })
    );
  }

  async getAccount(forceFetchToken) {
    if (
      !forceFetchToken &&
      this.account &&
      this.account.baseUrl &&
      this.account.token
    ) {
      return this.account;
    }

    await this.loginAccount();
    return this.account;
  }

  async setAccount({ session, baseUrl }) {
    this.account.token = session;
    this.account.baseUrl = baseUrl;
  }
}

const AccountManager = new AccountManagerClass();

export default AccountManager;
