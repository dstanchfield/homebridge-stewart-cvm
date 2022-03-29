import { Telnet } from 'telnet-client';

export const commands = {
  POS_16_BY_9: '#1.1.0.MOTOR=RECALL,1;',
  POS_4_BY_3: '#1.1.0.MOTOR=RECALL,2;',
  POS_1_85: '#1.1.0.MOTOR=RECALL,3;',
  POS_2_35: '#1.1.0.MOTOR=RECALL,4;',
  POS_USER_1: '#1.1.0.MOTOR=RECALL,5;',
  POS_USER_2: '#1.1.0.MOTOR=RECALL,6;',
};

export class CvmClient {
  private connection: Telnet = new Telnet();
  private connectionPromise;

  constructor(
    private readonly ip: string,
  ) {

    const params = {
      host: ip,
      port: 23,
      loginPrompt: 'User:',
      username: 'csidealer',
      passwordPrompt: 'Password:',
      password: '4212color',
      negotiationMandatory: false,
      ors: '\r\n',
    };

    this.connectionPromise = this.connection.connect(params);
  }

  send(command) {
    this.connectionPromise = this.connectionPromise.then(() => {
      return this.connection.send(command);
    });
  }
}
