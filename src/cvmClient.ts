import { Telnet } from 'telnet-client';

type NotificationCallback = (
  (data: string) => void
);

export const positions = {
  POS_16_BY_9: '#1.1.0.MOTOR=RECALL,1;',
  POS_4_BY_3: '#1.1.0.MOTOR=RECALL,2;',
  POS_1_85: '#1.1.0.MOTOR=RECALL,3;',
  POS_2_35: '#1.1.0.MOTOR=RECALL,4;',
  POS_USER_1: '#1.1.0.MOTOR=RECALL,5;',
  POS_USER_2: '#1.1.0.MOTOR=RECALL,6;',
};

export const notifications = {
  POS_16_BY_9_IP: '#1.1.0.MOTOR=RECALL,1(PRI 8);',
  POS_16_BY_9_IR: '#1.1.0.MOTOR=RECALL,1(IR);',
  POS_4_BY_3_IP: '#1.1.0.MOTOR=RECALL,2(PRI 8);',
  POS_4_BY_3_IR: '#1.1.0.MOTOR=RECALL,2(IR);',
  POS_1_85_IP: '#1.1.0.MOTOR=RECALL,3(PRI 8);',
  POS_1_85_IR: '#1.1.0.MOTOR=RECALL,3(IR);',
  POS_2_35_IP: '#1.1.0.MOTOR=RECALL,4(PRI 8);',
  POS_2_35_IR: '#1.1.0.MOTOR=RECALL,4(IR);',
  POS_USER_1_IP: '#1.1.0.MOTOR=RECALL,5(PRI 8);',
  POS_USER_1_IR: '#1.1.0.MOTOR=RECALL,5(IR);',
  POS_USER_2_IP: '#1.1.0.MOTOR=RECALL,6(PRI 8);',
  POS_USER_2_IR: '#1.1.0.MOTOR=RECALL,6(IR);',
};

export class CvmClient {
  private connection: Telnet = new Telnet();
  private connectionPromise;
  private changeNotifications: NotificationCallback [] = [];

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

    this.connection.on('data', (data) => {
      const notification = data.toString().trim();

      switch (notification) {
        case notifications.POS_16_BY_9_IP:
        case notifications.POS_16_BY_9_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_16_BY_9));
          break;
        case notifications.POS_1_85_IP:
        case notifications.POS_1_85_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_1_85));
          break;
        case notifications.POS_2_35_IP:
        case notifications.POS_2_35_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_2_35));
          break;
        case notifications.POS_4_BY_3_IP:
        case notifications.POS_4_BY_3_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_4_BY_3));
          break;
        case notifications.POS_USER_1_IP:
        case notifications.POS_USER_1_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_USER_1));
          break;
        case notifications.POS_USER_2_IP:
        case notifications.POS_USER_2_IR:
          this.changeNotifications.forEach((cb: NotificationCallback) => cb(positions.POS_USER_2));
      }
    });

    this.connectionPromise = this.connection.connect(params);
  }

  call(position) {
    this.connectionPromise = this.connectionPromise.then(() => {
      return this.connection.send(position);
    });
  }

  onChange(cb) {
    this.changeNotifications.push(cb);
  }
}
